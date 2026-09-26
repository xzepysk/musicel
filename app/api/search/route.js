import { NextResponse } from "next/server";

const RELAY_BASE = "http://benben.seyori.name.ng:2054/api/relay";

function relay(targetUrl) {
  return `${RELAY_BASE}?url=${encodeURIComponent(targetUrl)}`;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "song";

  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const url = relay(`https://api-faa.my.id/faa/youtube?q=${encodeURIComponent(term)}`);

  try {
    const res = await fetch(url);

    const bodyText = await res.text();

    if (!res.ok) {
      throw new Error(`API returned ${res.status}: ${bodyText.slice(0, 200)}`);
    }

    let data;
    try {
      data = JSON.parse(bodyText);
    } catch {
      throw new Error(`Non-JSON response: ${bodyText.slice(0, 200)}`);
    }

    if (!data.status || !data.result) {
      return NextResponse.json({ results: [] });
    }

    const results = (data.result || []).map((item) => {
      const link = item.link || "";
      let videoId = "";
      try {
        videoId = new URL(link).searchParams.get("v") || "";
      } catch {
        videoId = "";
      }

      return {
        externalId: String(videoId),
        kind: type,
        title: item.title,
        artist: item.channel || item.author || "YouTube",
        albumName: item.collectionName || null,
        artworkUrl: item.thumbnail || `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
        previewUrl: null,
        trackCount: item.trackCount || null,
        releaseDate: item.publishedTime || item.releaseDate || null,
        videoId: videoId,
        link: link,
        mp3Api: relay(`https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent('https://youtube.com/watch?v=' + videoId)}`)
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    console.error("SEARCH_ERROR:", err.message);
    return NextResponse.json({ results: [], error: "Search failed, try again.", debug: err.message }, { status: 502 });
  }
    }
