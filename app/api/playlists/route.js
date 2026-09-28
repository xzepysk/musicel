import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
export const dynamic = "force-dynamic";
const FILE = process.env.VERCEL ? "/tmp/playlists.json" : path.join(process.cwd(), "data", "playlists.json");
const MAX_PER_IP = 500;

function readDb() {
  try { return JSON.parse(fs.readFileSync(FILE, "utf8")); } catch { return {}; }
}
function writeDb(db) {
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, JSON.stringify(db));
}
function getIp(req) {
  const h = req.headers;
  return h.get("cf-connecting-ip") || (h.get("x-forwarded-for") || "").split(",")[0].trim() || h.get("x-real-ip") || "unknown";
}
const str = (v, n = 300) => (typeof v === "string" ? v.slice(0, n) : "");
function clean(s) {
  const videoId = str(s?.videoId || s?.externalId, 40);
  if (!videoId) return null;
  return {
    externalId: videoId, kind: "song", videoId,
    title: str(s.title), artist: str(s.artist),
    artworkUrl: str(s.artworkUrl, 500), link: str(s.link, 500), mp3Api: str(s.mp3Api, 800),
  };
}
async function body(req) { try { return await req.json(); } catch { return null; } }

export async function GET(req) {
  const db = readDb();
  return NextResponse.json({ playlist: db[getIp(req)] || [] });
}

async function remove(req, item) {
  const ip = getIp(req), db = readDb();
  const id = item?.videoId || item?.externalId || new URL(req.url).searchParams.get("id");
  db[ip] = (db[ip] || []).filter((x) => x.videoId !== id);
  writeDb(db);
  return NextResponse.json({ ok: true, playlist: db[ip] });
}

export async function POST(req) {
  const data = await body(req);
  if (new URL(req.url).searchParams.get("remove")) return remove(req, data);
  const item = clean(data);
  if (!item) return NextResponse.json({ ok: false, error: "invalid item" }, { status: 400 });
  const ip = getIp(req), db = readDb();
  const list = (db[ip] || []).filter((x) => x.videoId !== item.videoId);
  list.unshift(item);
  db[ip] = list.slice(0, MAX_PER_IP);
  writeDb(db);
  return NextResponse.json({ ok: true, playlist: db[ip] });
}

export async function DELETE(req) {
  return remove(req, await body(req));
}
