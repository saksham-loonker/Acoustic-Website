const project = Deno.env.get("SUPABASE_URL")!;
const credentials = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const route = "/windows-neurodivergent";
const installerUrl = "https://acoustic.acst.workers.dev/windows-neurodivergent-installer";
const lifetime = 45 * 60;
const baseHeaders = {
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "referrer-policy": "no-referrer",
};
const encoder = new TextEncoder();
const key = crypto.subtle.importKey(
  "raw", encoder.encode(credentials), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
);
const ticketMessage = (expiry: string) => encoder.encode(`windows-neurodivergent:download:${expiry}`);

function error(message: string, status: number) {
  return Response.json({ error: message }, { status, headers: baseHeaders });
}

async function authorizeDownload(ticket: string | null) {
  const parts = ticket?.match(/^(\d{10})\.([0-9a-f]{64})$/);
  if (!parts || Number(parts[1]) <= Math.floor(Date.now() / 1000)) return false;
  const signature = Uint8Array.from(parts[2].match(/../g)!, (byte) => parseInt(byte, 16));
  return crypto.subtle.verify("HMAC", await key, signature, ticketMessage(parts[1]));
}

async function signUp(request: Request) {
  if (request.headers.get("content-type")?.split(";")[0].trim() !== "application/json") {
    return error("Submit the signup form to get the installer.", 415);
  }
  if (Number(request.headers.get("content-length")) > 2048) return error("Signup is too long.", 413);
  const raw = await request.text();
  if (raw.length > 2048) return error("Signup is too long.", 413);
  let info;
  try { info = JSON.parse(raw); } catch { return error("Enter your name and email address.", 400); }
  const name = typeof info?.name === "string" ? info.name.trim() : "";
  const email = typeof info?.email === "string" ? info.email.trim().toLowerCase() : "";
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name) ||
      email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email) || info?.website) {
    return error("Enter your name and a valid email address.", 400);
  }

  const saved = await fetch(project + "/rest/v1/neurodivergent_mailing_list?on_conflict=email", {
    method: "POST",
    headers: {
      apikey: credentials,
      authorization: "Bearer " + credentials,
      "content-type": "application/json",
      prefer: "resolution=ignore-duplicates, return=minimal",
    },
    body: JSON.stringify({ name, email }),
    signal: AbortSignal.timeout(8000),
  });
  if (!saved.ok) return error("Could not save your signup. Please try again.", 503);
  await saved.body?.cancel();

  const expiry = String(Math.floor(Date.now() / 1000) + lifetime);
  const signature = await crypto.subtle.sign("HMAC", await key, ticketMessage(expiry));
  const hex = Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
  const download = new URL("/functions/v1" + route + "/download", request.url);
  download.protocol = "https:";
  download.searchParams.set("ticket", expiry + "." + hex);
  return Response.json({ download: download.href }, { headers: baseHeaders });
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  const pathname = url.pathname.replace(/^\/functions\/v1(?=\/)/, "");
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        ...baseHeaders, "access-control-allow-methods": "POST, GET, HEAD, OPTIONS",
        "access-control-allow-headers": "content-type",
      } });
    }
    if (request.method === "POST" && pathname === route) return await signUp(request);
    if (["GET", "HEAD"].includes(request.method) && pathname === route + "/download") {
      const ticket = url.searchParams.get("ticket");
      if (!await authorizeDownload(ticket)) return error("This download link has expired. Sign up again to get a new link.", 403);
      const target = new URL(installerUrl);
      target.searchParams.set("ticket", ticket!);
      return new Response(null, { status: 307, headers: { ...baseHeaders, location: target.href } });
    }
    if (request.method === "GET" && pathname === route + "/download-authorization") {
      if (!await authorizeDownload(url.searchParams.get("ticket"))) return error("Invalid download link.", 403);
      return new Response(null, { status: 204, headers: baseHeaders });
    }
    return error("Not found.", 404);
  } catch {
    return error("The Neurodivergent installer is temporarily unavailable. Please try again.", 503);
  }
});
