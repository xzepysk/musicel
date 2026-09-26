"use client";

import { useEffect, useState } from "react";

export default function AddToPlaylistSheet({ track, onClose, onSaved }) {
  const [playlists, setPlaylists] = useState(null);
  const [newName, setNewName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/playlists")
      .then((r) => r.json())
      .then((d) => setPlaylists(d.playlists || []))
      .catch(() => setPlaylists([]));
  }, []);

  async function saveInto(playlistId) {
    setError("");
    const res = await fetch(`/api/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(track)
    });
    if (res.ok) {
      onSaved?.();
    } else {
      const d = await res.json().catch(() => ({}));
      setError(d.error || "Could not save.");
    }
  }

  async function createAndSave() {
    if (!newName.trim()) return;
    setCreating(true);
    const res = await fetch("/api/playlists", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName.trim() })
    });
    const d = await res.json();
    setCreating(false);
    if (res.ok) {
      await saveInto(d.playlist.id);
    } else {
      setError(d.error || "Could not create playlist.");
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h4>Save to playlist</h4>

        <input
          className="sheet-input"
          placeholder="Create a new playlist…"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
        />
        <button className="btn-primary" disabled={!newName.trim() || creating} onClick={createAndSave}>
          {creating ? "Creating…" : "Create & save"}
        </button>

        {error && <p style={{ color: "var(--danger)", fontSize: 13, marginTop: 10 }}>{error}</p>}

        <div className="section-label" style={{ padding: "16px 0 6px" }}>
          Your playlists
        </div>

        {playlists === null && <p style={{ color: "var(--text-dim)" }}>Loading…</p>}
        {playlists?.length === 0 && (
          <p style={{ color: "var(--text-dim)", fontSize: 14 }}>No playlists yet. Create one above.</p>
        )}
        {playlists?.map((p) => (
          <button
            key={p.id}
            className="btn-ghost"
            style={{ textAlign: "left", color: "var(--text)" }}
            onClick={() => saveInto(p.id)}
          >
            {p.name} · {p._count?.tracks ?? 0} tracks
          </button>
        ))}
      </div>
    </div>
  );
}
