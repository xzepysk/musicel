"use client";
import { useEffect, useState, useCallback } from "react";
import { useSession, signIn } from "next-auth/react";
import BottomNav from "../components/BottomNav";
import TrackRow from "../components/TrackRow";
import AddToPlaylistSheet from "../components/AddToPlaylistSheet";
import ShareSheet from "../components/ShareSheet";
import { useAudio } from "../components/AudioProvider";

const TABS = [
  { key: "song", label: "Songs" },
  { key: "album", label: "Album" },
  { key: "artist", label: "Artis / Band" }
];

function buildQuery(q, type) {
  const base = q.trim() || "metallica";
  if (type === "song") return `${base} song`;
  if (type === "album") return `${base} album`;
  if (type === "artist") return `${base} band`;
  return base;
}

export default function HomePage() {
  const { data: session } = useSession();
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("song");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [addTarget, setAddTarget] = useState(null);
  const [shareTarget, setShareTarget] = useState(null);
  const [toast, setToast] = useState("");
  const { playing, isPlaying, playTrack } = useAudio();

  const runSearch = useCallback(async (q, t) => {
    const finalQ = buildQuery(q, t);
    setLoading(true);
    try {
      const r = await fetch(`/api/search?q=${encodeURIComponent(finalQ)}&type=${t}`);
      const d = await r.json();
      setResults(d.results || d.result || d.data || []);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    runSearch("metallica", "song");
  }, []);

  useEffect(() => {
    if (!query.trim()) return;
    const id = setTimeout(() => runSearch(query, tab), 400);
    return () => clearTimeout(id);
  }, [query, tab, runSearch]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(""), 2000);
  }

  return (
    <div className="app-shell">
      <div className="topbar">
        <span className="brand-name">XamusiceL</span>
        <button className="icon-btn" onClick={() =>!session && signIn("google")}>Account</button>
      </div>
      <div className="search-box">
        <input placeholder="Search songs, albums, artists..." value={query} onChange={(e) => setQuery(e.target.value)} />
      </div>
      <div className="tabs">
        {TABS.map((t) => (
          <button key={t.key} className={`tab ${tab === t.key? "active" : ""}`} onClick={() => setTab(t.key)}>{t.label}</button>
        ))}
      </div>
      <div className="list" style={{ paddingBottom: 160 }}>
        {loading && <p style={{ padding: 12 }}>Searching...</p>}
        {results.map((item) => (
          <TrackRow key={item.externalId} item={item} subtitle={item.artist} onPlay={() => playTrack(item, results)} onAdd={() => { if (!session) signIn("google"); else setAddTarget(item); }} onShare={() => setShareTarget({ title: item.title, url: `${window.location.origin}/share/song/${item.externalId}` })} isPlaying={playing?.externalId === item.externalId && isPlaying} />
        ))}
      </div>
      {addTarget && <AddToPlaylistSheet track={addTarget} onClose={() => setAddTarget(null)} onSaved={() => { setAddTarget(null); showToast("Saved"); }} />}
      {shareTarget && <ShareSheet {...shareTarget} onClose={() => setShareTarget(null)} />}
      {toast && <div className="toast">{toast}</div>}
      <BottomNav />
    </div>
  );
}