import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../../lib/auth";
import { prisma } from "../../../../../lib/prisma";

async function assertOwner(playlistId, userId) {
  const playlist = await prisma.playlist.findUnique({ where: { id: playlistId } });
  if (!playlist || playlist.ownerId !== userId) return null;
  return playlist;
}

export async function POST(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const playlist = await assertOwner(params.id, session.user.id);
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const track = await request.json();
  if (!track.externalId || !track.title) {
    return NextResponse.json({ error: "Missing track data" }, { status: 400 });
  }

  try {
    const saved = await prisma.playlistTrack.create({
      data: {
        playlistId: params.id,
        externalId: String(track.externalId),
        kind: track.kind || "song",
        title: track.title,
        artist: track.artist || "",
        albumName: track.albumName || null,
        artworkUrl: track.artworkUrl || null,
        previewUrl: track.previewUrl || null
      }
    });
    await prisma.playlist.update({ where: { id: params.id }, data: { updatedAt: new Date() } });
    return NextResponse.json({ track: saved }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: "Already in this playlist" }, { status: 409 });
  }
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const playlist = await assertOwner(params.id, session.user.id);
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { searchParams } = new URL(request.url);
  const trackId = searchParams.get("trackId");
  if (!trackId) return NextResponse.json({ error: "trackId is required" }, { status: 400 });

  await prisma.playlistTrack.delete({ where: { id: trackId } });
  return NextResponse.json({ ok: true });
}
