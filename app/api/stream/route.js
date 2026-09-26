export const runtime = "edge";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing url", { status: 400 });
  }
  try {
    const range = req.headers.get("range");
    const res = await fetch(url, {
      headers: range ? { Range: range } : {},
    });
    if (!res.ok && res.status !== 206) throw new Error(`Upstream error ${res.status}`);
    if (!res.body) throw new Error("Upstream tidak ngasih body/stream");

    const headers = new Headers({
      "Content-Type": res.headers.get("content-type") || "audio/mpeg",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": "public, max-age=3600",
      "Accept-Ranges": "bytes",
    });
    const cl = res.headers.get("content-length");
    const cr = res.headers.get("content-range");
    if (cl) headers.set("Content-Length", cl);
    if (cr) headers.set("Content-Range", cr);

    return new Response(res.body, {
      status: res.status === 206 ? 206 : 200,
      headers,
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}
