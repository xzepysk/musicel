"use client";

import { useEffect, useState } from "react";
import { useSession, signIn } from "next-auth/react";
import Link from "next/link";
import BottomNav from "../../components/BottomNav";

export default function PlaylistLibraryPage() {
  const { data: session, status } = useSession();
  const [playlists, setPlaylists] = useState(null);
  const [newName, setNewName] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => setPlaylists(d.playlists || []));
  }, [status]);

  async function createPlaylist() {
    if (!newName.trim()) return;
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    });
    const d = await res.json();
    if (res.ok) {
      setPlaylists((prev) => [{ ...d.playlist, _count: { tracks: 0 } }, ...(prev || [])]);
      setNewName("");
      setShowCreate(false);
    }
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-name">Playlist</span>
        </div>
        {status === "authenticated" && (
          <button className="icon-btn" onClick={() => setShowCreate(true)} title="New playlist">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {status === "loading" && <p style={{ color: "var(--text-dim)", padding: 16 }}>Loading…</p>}

      {status === "unauthenticated" && (
        <div className="empty-state">
          <h3>Sign in to see your playlists</h3>
          <p>Save your favorite songs and albums into personal playlists.</p>
          <button className="google-btn" onClick={() => signIn("google")}>
            Sign in with Google
          </button>
        </div>
      )}

      {status === "authenticated" && playlists?.length === 0 && (
        <div className="empty-state">
          <h3>No playlists yet</h3>
          <p>Tap + in the top right to create your first playlist.</p>
        </div>
      )}

      <div className="list">
        {playlists?.map((p) => (
          <Link key={p.id} href={`/playlist/${p.id}`} className="row">
            <div className="row-avatar">{(p.name || "?").slice(0, 2).toUpperCase()}</div>
            <div className="row-body">
              <div className="row-title-line">
                <span className="row-title">{p.name}</span>
              </div>
              <div className="row-sub-line">
                <span className="row-subtitle">{p.isPublic ? "Public" : "Private"}</span>
                <span className="row-badge">{p._count?.tracks ?? 0}</span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {showCreate && (
        <div className="sheet-backdrop" onClick={() => setShowCreate(false)}>
          <div className="sheet" onClick={(e) => e.stopPropagation()}>
            <h4>New playlist</h4>
            <input
              className="sheet-input"
              placeholder="Playlist name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              autoFocus
            />
            <button className="btn-primary" disabled={!newName.trim()} onClick={createPlaylist}>
              Create
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
