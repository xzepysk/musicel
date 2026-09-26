import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../lib/auth";
import { prisma } from "../../../../lib/prisma";

export async function GET(request, { params }) {
  const playlist = await prisma.playlist.findUnique({
    where: { id: params.id },
    include: { tracks: { orderBy: { addedAt: "asc" } }, owner: { select: { name: true, image: true } } }
  });
  if (!playlist) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const session = await getServerSession(authOptions);
  const isOwner = session?.user?.id === playlist.ownerId;
  if (!playlist.isPublic && !isOwner) {
    return NextResponse.json({ error: "This playlist is private" }, { status: 403 });
  }

  return NextResponse.json({ playlist, isOwner });
}

export async function PATCH(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await prisma.playlist.findUnique({ where: { id: params.id } });
  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const body = await request.json();
  const playlist = await prisma.playlist.update({
    where: { id: params.id },
    data: {
      name: body.name ?? existing.name,
      description: body.description ?? existing.description,
      isPublic: typeof body.isPublic === "boolean" ? body.isPublic : existing.isPublic
    }
  });

  return NextResponse.json({ playlist });
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const existing = await prisma.playlist.findUnique({ where: { id: params.id } });
  if (!existing || existing.ownerId !== session.user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.playlist.delete({ where: { id: params.id } });
  return NextResponse.json({ ok: true });
}
