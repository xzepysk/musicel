import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../lib/auth";
import { prisma } from "../../../lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const playlists = await prisma.playlist.findMany({
    where: { ownerId: session.user.id },
    include: { _count: { select: { tracks: true } } },
    orderBy: { updatedAt: "desc" }
  });

  return NextResponse.json({ playlists });
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const name = (body.name || "").trim();
  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const playlist = await prisma.playlist.create({
    data: {
      name,
      description: body.description || null,
      ownerId: session.user.id
    }
  });

  return NextResponse.json({ playlist }, { status: 201 });
}
