const installerPath = "/windows-installer";
const macInstallerPath = "/mac-installer";
const macRelease = null;
const authorizeUrl = "https://qsycldeqkdgteccdpsty.supabase.co/functions/v1/windows-beta/download-authorization";
const githubAssets = "https://api.github.com/repos/saksham-loonker/Acoustic-Windows-Installers/releases/assets/";
const githubDownloadHosts = new Set(["release-assets.githubusercontent.com", "objects.githubusercontent.com"]);
const ticketPattern = /^\d{10}\.[0-9a-f]{64}$/;
const windowsInstallerName = /^Acoustic-Desktop-App-setup-\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?\.exe$/;
const macInstallerName = /^Acoustic-Desktop-App-\d+\.\d+\.\d+(?:-[a-zA-Z0-9.-]+)?-macos-universal\.dmg$/;
const downloadHeaders = {
  "cache-control": "private, no-store",
  "access-control-allow-origin": "*",
  "referrer-policy": "no-referrer",
  "x-content-type-options": "nosniff",
};

function rangeFor(header, size) {
  const match = header.match(/^bytes=(\d*)-(\d*)$/);
  if (!match || (!match[1] && !match[2])) return null;
  if (match.slice(1).some((value) => value && !Number.isSafeInteger(Number(value)))) return null;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
  return start <= end && start < size ? { start, end } : null;
}

function errorResponse(request, message, status) {
  return request.method === "HEAD"
    ? new Response(null, { status, headers: downloadHeaders })
    : Response.json({ error: message }, { status, headers: downloadHeaders });
}

async function fetchAsset(assetId, token, range) {
  const headers = { "accept-encoding": "identity" };
  if (range) headers.range = `bytes=${range.start}-${range.end}`;
  const api = await fetch(githubAssets + assetId, {
    redirect: "manual",
    headers: {
      ...headers,
      accept: "application/octet-stream",
      authorization: "Bearer " + token,
      "user-agent": "AcousticWindowsInstaller",
      "x-github-api-version": "2026-03-10",
    },
  });
  if (api.status !== 302) return api;
  await api.body?.cancel();
  const target = new URL(api.headers.get("location"));
  if (target.protocol !== "https:" || !githubDownloadHosts.has(target.hostname) ||
      target.port || target.username || target.password) throw Error("Unexpected GitHub download host");
  return fetch(target.href, { redirect: "manual", headers });
}

async function downloadInstaller(request, url, token) {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: {
      ...downloadHeaders, "access-control-allow-methods": "GET, HEAD, OPTIONS",
      "access-control-allow-headers": "range",
    } });
  }
  if (request.method !== "GET" && request.method !== "HEAD")
    return errorResponse(request, "Method not allowed.", 405);
  const ticket = url.searchParams.get("ticket");
  const invalid = "This download link has expired. Request a new installer link on the Acoustic website.";
  if (!ticketPattern.test(ticket ?? "") || Number(ticket.slice(0, 10)) < Math.floor(Date.now() / 1000))
    return errorResponse(request, invalid, 403);

  const endpoint = new URL(authorizeUrl);
  endpoint.searchParams.set("ticket", ticket);
  const authorization = await fetch(endpoint.href, { redirect: "manual", signal: AbortSignal.timeout(8000) });
  if (authorization.status === 403) return errorResponse(request, invalid, 403);
  if (!authorization.ok) throw Error("Installer authorization returned " + authorization.status);
  if (!token) throw Error("Installer GitHub secret unavailable");
  const mac = url.pathname === macInstallerPath;
  const { filename, bytes, assetId } = mac ? macRelease : await authorization.json();
  const installerName = mac ? macInstallerName : windowsInstallerName;
  if (typeof filename !== "string" || !installerName.test(filename) ||
      !Number.isSafeInteger(bytes) || bytes <= 0 ||
      !Number.isSafeInteger(assetId) || assetId <= 0) throw Error("Invalid installer metadata");

  const rangeHeader = request.headers.get("range");
  const range = rangeHeader === null ? null : rangeFor(rangeHeader, bytes);
  if (rangeHeader !== null && !range) {
    return new Response(null, { status: 416, headers: {
      ...downloadHeaders, "content-range": `bytes */${bytes}`,
    } });
  }

  const probe = request.method === "HEAD";
  const requested = probe ? { start: 0, end: 0 } : range;
  const response = await fetchAsset(assetId, token, requested);
  const length = range ? range.end - range.start + 1 : bytes;
  const expectedRange = requested ? `bytes ${requested.start}-${requested.end}/${bytes}` : null;
  const expectedLength = requested ? requested.end - requested.start + 1 : bytes;
  if (response.status !== (requested ? 206 : 200) || !response.body ||
      response.headers.get("content-range") !== expectedRange ||
      response.headers.get("content-length") !== String(expectedLength)) {
    await response.body?.cancel();
    throw Error("Unexpected installer response status " + response.status);
  }
  if (probe) await response.body.cancel();
  const headers = new Headers({
    ...downloadHeaders,
    "content-type": "application/octet-stream",
    "content-disposition": `attachment; filename="${filename}"`,
    "content-length": String(length),
    "accept-ranges": "bytes",
  });
  if (range) headers.set("content-range", `bytes ${range.start}-${range.end}/${bytes}`);
  return new Response(probe ? null : response.body, { status: range ? 206 : 200, headers });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/mac-release" && request.method === "GET") {
      if (!macRelease) return errorResponse(request, "The Mac beta is not available yet.", 404);
      const { version, filename, bytes, sha256 } = macRelease;
      return Response.json({ version, filename, bytes, sha256 }, { headers: downloadHeaders });
    }
    if (url.pathname !== installerPath && url.pathname !== macInstallerPath) return env.ASSETS.fetch(request);
    if (url.pathname === macInstallerPath && !macRelease)
      return errorResponse(request, "The Mac beta is not available yet.", 404);
    try {
      return await downloadInstaller(request, url, env.GITHUB_INSTALLER_TOKEN);
    } catch (error) {
      console.error("Desktop installer delivery failed", error.name);
      return errorResponse(request, "The installer is temporarily unavailable. Please try again.", 503);
    }
  },
};
