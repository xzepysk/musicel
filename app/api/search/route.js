import { NextResponse } from "next/server";

const ENTITY_MAP = {
  song: "song",
  album: "album",
  artist: "musicArtist"
};

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const term = searchParams.get("q")?.trim();
  const type = searchParams.get("type") || "song";

  if (!term) {
    return NextResponse.json({ results: [] });
  }

  const url = `https://api-faa.my.id/faa/youtube?q=${encodeURIComponent(term)}`;

  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    const data = await res.json();

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
        // buat play kayak bot lu
        videoId: videoId,
        link: link,
        mp3Api: `https://api-faa.my.id/faa/ytmp3?url=${encodeURIComponent('https://youtube.com/watch?v=' + videoId)}`
      };
    });

    return NextResponse.json({ results });
  } catch (err) {
    return NextResponse.json({ results: [], error: "Search failed, try again." }, { status: 502 });
  }
}