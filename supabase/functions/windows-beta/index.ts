const project = Deno.env.get("SUPABASE_URL")!;
const credentials = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const authHeaders = { apikey: credentials, authorization: "Bearer " + credentials };
const encoder = new TextEncoder();
const bucket = "acoustic-installers";
const filename = "Acoustic-Desktop-App-setup-0.8.1.exe";
const release = "0.8.1";
const bytes = 263274077;
const partSize = 32 * 1024 * 1024;
const lifetime = 45 * 60;
const path = "/functions/v1/windows-beta";
const baseHeaders = {
  "cache-control": "no-store",
  "access-control-allow-origin": "*",
  "referrer-policy": "no-referrer",
};
const ticketKey = crypto.subtle.importKey(
  "raw", encoder.encode(credentials), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"],
);

function json(body: object, status = 200) {
  return Response.json(body, { status, headers: baseHeaders });
}

async function makeTicket() {
  const expiry = Math.floor(Date.now() / 1000) + lifetime;
  const signature = await crypto.subtle.sign("HMAC", await ticketKey, encoder.encode(filename + ":" + expiry));
  return expiry + "." + Array.from(new Uint8Array(signature), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function validTicket(value: string | null) {
  const ticket = value?.match(/^(\d{10})\.([0-9a-f]{64})$/);
  if (!ticket || Number(ticket[1]) < Math.floor(Date.now() / 1000)) return false;
  const signature = Uint8Array.from(ticket[2].match(/../g)!, (pair) => parseInt(pair, 16));
  return crypto.subtle.verify("HMAC", await ticketKey, signature, encoder.encode(filename + ":" + ticket[1]));
}

async function signup(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) {
    return json({ error: "Submit the signup form to get the installer." }, 415);
  }
  if (Number(request.headers.get("content-length")) > 2048) return json({ error: "Signup is too long." }, 413);
  const raw = await request.text();
  if (raw.length > 2048) return json({ error: "Signup is too long." }, 413);
  let info;
  try { info = JSON.parse(raw); } catch { return json({ error: "Enter your name and email address." }, 400); }
  const name = typeof info?.name === "string" ? info.name.trim() : "";
  const email = typeof info?.email === "string" ? info.email.trim().toLowerCase() : "";
  if (!name || name.length > 120 || /[\u0000-\u001f\u007f]/.test(name) ||
      email.length > 254 || !/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(email) || info?.website) {
    return json({ error: "Enter your name and a valid email address." }, 400);
  }
  const saved = await fetch(project + "/rest/v1/beta_mailing_list?on_conflict=email", {
    method: "POST",
    headers: { ...authHeaders, "content-type": "application/json", prefer: "resolution=ignore-duplicates,return=minimal" },
    body: JSON.stringify({ name, email }),
  });
  if (!saved.ok) return json({ error: "We couldn’t save your signup. Please try again." }, 503);
  // Use the incoming public host. SUPABASE_URL may be an internal runtime address.
  const location = new URL(request.url);
  const download = new URL(path + "/download", location.origin);
  download.protocol = "https:";
  download.searchParams.set("ticket", await makeTicket());
  return json({ download: download.href });
}

function byteRange(value: string | null) {
  if (!value) return { start: 0, end: bytes - 1 };
  const range = value.match(/^bytes=(\d*)-(\d*)$/);
  if (!range || (!range[1] && !range[2])) return null;
  const start = range[1] ? Number(range[1]) : Math.max(0, bytes - Number(range[2]));
  const end = range[1] && range[2] ? Math.min(Number(range[2]), bytes - 1) : bytes - 1;
  return start <= end && start < bytes ? { start, end } : null;
}

async function download(request: Request, url: URL) {
  if (!await validTicket(url.searchParams.get("ticket"))) {
    return json({ error: "This download link has expired. Submit the signup form for a new one." }, 403);
  }
  const rangeHeader = request.headers.get("range");
  const range = byteRange(rangeHeader);
  if (!range) return new Response(null, { status: 416, headers: { ...baseHeaders, "content-range": `bytes */${bytes}` } });

  const { start, end } = range;
  const headers = new Headers({
    ...baseHeaders,
    "content-type": "application/octet-stream",
    "content-disposition": `attachment; filename="${filename}"`,
    "content-length": String(end - start + 1),
    "accept-ranges": "bytes",
    "x-content-type-options": "nosniff",
  });
  if (rangeHeader) headers.set("content-range", `bytes ${start}-${end}/${bytes}`);
  const status = rangeHeader ? 206 : 200;
  if (request.method === "HEAD") return new Response(null, { status, headers });

  const abort = new AbortController();
  let part = Math.floor(start / partSize);
  const lastPart = Math.floor(end / partSize);
  const openPart = async (index: number) => {
    const offset = index * partSize;
    const first = Math.max(0, start - offset);
    const last = Math.min(partSize - 1, bytes - offset - 1, end - offset);
    const object = `${project}/storage/v1/object/authenticated/${bucket}/${release}/part-${index}`;
    const fullPart = first === 0 && last === Math.min(partSize, bytes - offset) - 1;
    const response = await fetch(object, {
      signal: abort.signal,
      headers: fullPart ? authHeaders : { ...authHeaders, range: `bytes=${first}-${last}` },
    });
    if (response.status !== (fullPart ? 200 : 206) || !response.body) throw new Error("Installer part unavailable");
    return response.body.getReader();
  };
  let reader = await openPart(part);
  const stream = new ReadableStream<Uint8Array>({
    async pull(controller) {
      for (;;) {
        const { value, done } = await reader.read();
        if (!done) {
          controller.enqueue(value);
          return;
        }
        reader.releaseLock();
        if (++part > lastPart) {
          controller.close();
          return;
        }
        reader = await openPart(part);
      }
    },
    cancel() { abort.abort(); },
  });
  return new Response(stream, { status, headers });
}

Deno.serve(async (request) => {
  const url = new URL(request.url);
  try {
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: {
        ...baseHeaders, "access-control-allow-methods": "POST, GET, HEAD, OPTIONS",
        "access-control-allow-headers": "content-type",
      } });
    }
    if (request.method === "POST" && url.pathname.endsWith("/windows-beta")) return await signup(request);
    if (["GET", "HEAD"].includes(request.method) && url.pathname.endsWith("/download")) return await download(request, url);
    return json({ error: "Not found." }, 404);
  } catch {
    return json({ error: "The Windows beta is temporarily unavailable. Please try again." }, 503);
  }
});
