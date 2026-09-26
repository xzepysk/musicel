"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import BottomNav from "../../../components/BottomNav";
import TrackRow from "../../../components/TrackRow";
import ShareSheet from "../../../components/ShareSheet";

export default function PlaylistDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [shareTarget, setShareTarget] = useState(null);

  async function load() {
    const res = await fetch(`/api/playlists/${id}`);
    const d = await res.json();
    if (!res.ok) {
      setError(d.error || "Could not load");
      return;
    }
    setData(d);
  }

  useEffect(() => {
    load();
  }, [id]);

  async function removeTrack(trackId) {
    await fetch(`/api/playlists/${id}/tracks?trackId=${trackId}`, { method: "DELETE" });
    load();
  }

  async function deletePlaylist() {
    if (!confirm("Delete this playlist?")) return;
    await fetch(`/api/playlists/${id}`, { method: "DELETE" });
    router.push("/playlist");
  }

  function sharePlaylist() {
    setShareTarget({
      title: data.playlist.name,
      url: `${window.location.origin}/share/playlist/${data.playlist.shareSlug}`
    });
  }

  if (error) {
    return (
      <div className="app-shell">
        <div className="empty-state">
          <h3>Could not open this</h3>
          <p>{error}</p>
        </div>
        <BottomNav />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="app-shell">
        <p style={{ color: "var(--text-dim)", padding: 16 }}>Loading…</p>
        <BottomNav />
      </div>
    );
  }

  const { playlist, isOwner } = data;

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <button className="icon-btn" onClick={() => router.back()} style={{ marginRight: 4 }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span className="brand-name">{playlist.name}</span>
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={sharePlaylist} title="Share playlist">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 12v7a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-7M16 6l-4-4-4 4M12 2v14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
          {isOwner && (
            <button className="icon-btn" onClick={deletePlaylist} title="Delete playlist">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m-9 0 1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {playlist.tracks.length === 0 && (
        <div className="empty-state">
          <h3>This playlist is empty</h3>
          <p>Save songs from the Search page to fill this playlist.</p>
        </div>
      )}

      <div className="list">
        {playlist.tracks.map((t) => (
          <TrackRow
            key={t.id}
            item={{ title: t.title, artworkUrl: t.artworkUrl, kind: t.kind, externalId: t.externalId }}
            subtitle={`${t.artist}${t.albumName ? " · " + t.albumName : ""}`}
            onRemove={isOwner ? () => removeTrack(t.id) : undefined}
          />
        ))}
      </div>

      {shareTarget && <ShareSheet {...shareTarget} onClose={() => setShareTarget(null)} />}

      <BottomNav />
    </div>
  );
}
