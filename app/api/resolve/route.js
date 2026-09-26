import { NextResponse } from "next/server";

const RELAY_BASE = "http://benben.seyori.name.ng:2054/api/relay";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const target = searchParams.get("url");
  if (!target) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    const res = await fetch(`${RELAY_BASE}?url=${encodeURIComponent(target)}`);
    const bodyText = await res.text();
    if (!res.ok) throw new Error(`Relay returned ${res.status}: ${bodyText.slice(0, 200)}`);

    let parsed;
    try {
      parsed = JSON.parse(bodyText);
    } catch {
      throw new Error(`Non-JSON from relay: ${bodyText.slice(0, 200)}`);
    }

    const mp3 = parsed.result?.mp3 || parsed.result?.url;
    if (!mp3) throw new Error("MP3 link not found in relay response");

    return NextResponse.json({ mp3 });
  } catch (err) {
    console.error("RESOLVE_ERROR:", err.message);
    return NextResponse.json({ error: err.message }, { status: 502 });
  }
}
