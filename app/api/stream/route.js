export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  if (!url) {
    return new Response("Missing url", { status: 400 });
  }
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch mp3");
    const buf = await res.arrayBuffer();
    return new Response(buf, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=3600",
      },
    });
  } catch (e) {
    return new Response(e.message, { status: 500 });
  }
}