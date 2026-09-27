"use client";
import { createContext, useContext, useRef, useState, useEffect } from "react";
const AudioContext = createContext(null);

export function AudioProvider({ children }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(null);
  const [queue, setQueue] = useState([]);
  const [originalQueue, setOriginalQueue] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState("off");
  const [volume, setVolume] = useState(0.9);
  const [isMuted, setIsMuted] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [sleepTimer, setSleepTimer] = useState(null);
  const [lyrics, setLyrics] = useState([]);
  const [showQueue, setShowQueue] = useState(false);

  async function playTrack(track, fullList = []) {
    if (fullList.length > 0) {
      setQueue(fullList);
      setOriginalQueue(fullList);
    }
    setPlaying(track);
    setIsPlaying(false);
    setLyrics([]);
    fetch(`/api/lyrics?q=${encodeURIComponent(track.title + " " + track.artist)}`).then(r => r.json()).then(d => setLyrics(d.lyrics || [])).catch(() => {});
    try {
      const res = await fetch(`/api/resolve?url=${encodeURIComponent(track.mp3Api)}`);
      const json = await res.json();
      const mp3 = json.mp3;
      if (!mp3) throw new Error(json.error || "MP3 not found");
      const proxied = `/api/stream?url=${encodeURIComponent(mp3)}`;
      const a = audioRef.current;
      if (!a) return;
      a.src = proxied;
      a.volume = isMuted? 0 : volume;
      a.play().then(() => setIsPlaying(true)).catch(() => {});
      if ("mediaSession" in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: track.title,
          artist: track.artist,
          artwork: [{ src: track.artworkUrl, sizes: "512x512" }]
        });
      }
    } catch (e) {
      console.error("PLAY_ERROR:", e.message, "track:", track.title);
      // gagal resolve mp3 buat lagu ini, jangan stuck diem - lanjut ke next kalau ada
      setQueue(currentQueue => {
        const idx = currentQueue.findIndex(t => t.externalId === track.externalId);
        if (idx >= 0 && idx < currentQueue.length - 1) {
          playTrack(currentQueue[idx + 1]);
        }
        return currentQueue;
      });
    }
  }

  function togglePlay() {
    const a = audioRef.current;
    if (!a) return;
    if (isPlaying) { a.pause(); setIsPlaying(false); } else { a.play(); setIsPlaying(true); }
  }

  function seek(t) {
    const a = audioRef.current;
    if (!a) return;
    a.currentTime = t;
    setCurrentTime(t);
  }

  function skipForward() { seek(Math.min(currentTime + 10, duration)); }
  function skipBackward() { seek(Math.max(currentTime - 10, 0)); }
  function setVol(v) { setVolume(v); if (audioRef.current) audioRef.current.volume = isMuted? 0 : v; }

  function playNext() {
    if (repeatMode === "one") { seek(0); audioRef.current?.play(); return; }
    const idx = queue.findIndex(t => t.externalId === playing.externalId);
    if (idx < queue.length - 1) playTrack(queue[idx + 1]);
    else if (repeatMode === "all" && queue.length > 0) playTrack(queue[0]);
  }

  function playPrev() {
    const idx = queue.findIndex(t => t.externalId === playing.externalId);
    if (currentTime > 3) seek(0);
    else if (idx > 0) playTrack(queue[idx - 1]);
  }

  function toggleShuffle() {
    if (!isShuffle) { setQueue([...queue].sort(() => Math.random() - 0.5)); setIsShuffle(true); }
    else { setQueue(originalQueue); setIsShuffle(false); }
  }

  function toggleRepeat() { setRepeatMode(p => p === "off"? "all" : p === "all"? "one" : "off"); }

  useEffect(() => {
    if (!sleepTimer) return;
    const id = setTimeout(() => { audioRef.current?.pause(); setIsPlaying(false); setSleepTimer(null); }, sleepTimer * 60000);
    return () => clearTimeout(id);
  }, [sleepTimer]);

  function downloadCurrent() {
    if (!playing) return;
    const a = document.createElement("a");
    a.href = audioRef.current?.src || "";
    a.download = `${playing.title}.mp3`;
    a.click();
  }

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onEnded = () => playNext();
    const onTime = () => setCurrentTime(a.currentTime);
    const onMeta = () => setDuration(a.duration || 0);
    a.addEventListener("ended", onEnded);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    if ("mediaSession" in navigator) {
      try {
        navigator.mediaSession.setActionHandler("nexttrack", playNext);
        navigator.mediaSession.setActionHandler("previoustrack", playPrev);
        navigator.mediaSession.setActionHandler("seekforward", skipForward);
        navigator.mediaSession.setActionHandler("seekbackward", skipBackward);
      } catch {}
    }
    return () => {
      a.removeEventListener("ended", onEnded);
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
    };
  }, [queue, playing, repeatMode]);

  return (
    <AudioContext.Provider value={{ playing, isPlaying, playTrack, togglePlay, seek, skipForward, skipBackward, playNext, playPrev, toggleShuffle, toggleRepeat, isShuffle, repeatMode, currentTime, duration, volume, setVol, isMuted, setIsMuted, queue, lyrics, downloadCurrent, sleepTimer, setSleepTimer, isExpanded, setIsExpanded, showQueue, setShowQueue }}>
      {children}
      <audio ref={audioRef} />
      {playing && (
        <>
          <div onClick={() => setIsExpanded(true)} style={{ position: "fixed", bottom: 60, left: 0, right: 0, background: "#18181b", borderTop: "1px solid #27272a", padding: "10px 14px", zIndex: 50 }}>
            <input type="range" min={0} max={duration || 100} value={currentTime} onClick={e => e.stopPropagation()} onChange={e => seek(Number(e.target.value))} style={{ width: "100%", accentColor: "#fff", height: 3 }} />
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 6 }}>
              <img src={playing.artworkUrl} style={{ width: 44, height: 44, borderRadius: 6 }} />
              <div style={{ flex: 1, overflow: "hidden" }}><p style={{ fontSize: 13, fontWeight: 600, color: "#fff", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{playing.title}</p><p style={{ fontSize: 11, color: "#a1a1aa" }}>{playing.artist}</p></div>
              <button onClick={e => { e.stopPropagation(); skipBackward(); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 20, padding: "5px 9px", fontSize: 13, color: "#fff" }}>↺</button>
              <button onClick={e => { e.stopPropagation(); togglePlay(); }} style={{ background: "#fff", color: "#000", borderRadius: 999, width: 34, height: 34, fontWeight: 800, border: "none" }}>{isPlaying? "II" : "▶"}</button>
              <button onClick={e => { e.stopPropagation(); skipForward(); }} style={{ background: "transparent", border: "1px solid #333", borderRadius: 20, padding: "5px 9px", fontSize: 13, color: "#fff" }}>↻</button>
            </div>
          </div>
          {isExpanded && (
            <div style={{ position: "fixed", inset: 0, background: "#000", zIndex: 100, padding: 20, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}><button onClick={() => setIsExpanded(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20 }}>⌄</button><button onClick={() => setShowQueue(!showQueue)} style={{ background: "transparent", border: "none", color: "#fff" }}>☰ Queue</button></div>
              <img src={playing.artworkUrl} style={{ width: "100%", aspectRatio: "1", objectFit: "cover", borderRadius: 20, marginTop: 20 }} />
              <div style={{ marginTop: 16 }}><h2 style={{ color: "#fff", fontSize: 22, fontWeight: 700 }}>{playing.title}</h2><p style={{ color: "#a1a1aa" }}>{playing.artist}</p></div>
              <div style={{ flex: 1, overflowY: "auto", marginTop: 16, background: "#111", borderRadius: 12, padding: 12 }}>{lyrics.length > 0? lyrics.map((l, i) => <p key={i} style={{ color: Math.abs(l.time - currentTime) < 2? "#fff" : "#555", fontSize: 14, margin: "4px 0" }}>{l.text}</p>) : <p style={{ color: "#555" }}>No lyrics</p>}</div>
              <input type="range" min={0} max={duration || 100} value={currentTime} onChange={e => seek(Number(e.target.value))} style={{ width: "100%", accentColor: "#fff", marginTop: 12 }} />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16 }}>
                <button onClick={toggleShuffle} style={{ background: "transparent", border: "none", color: isShuffle? "#1DB954" : "#fff", fontSize: 18 }}>🔀</button>
                <button onClick={playPrev} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20 }}>⏮</button>
                <button onClick={skipBackward} style={{ background: "transparent", border: "1px solid #333", borderRadius: 20, padding: "6px 12px", color: "#fff", fontSize: 16 }}>↺</button>
                <button onClick={togglePlay} style={{ background: "#fff", width: 64, height: 64, borderRadius: 999, fontSize: 24, border: "none" }}>{isPlaying? "II" : "▶"}</button>
                <button onClick={skipForward} style={{ background: "transparent", border: "1px solid #333", borderRadius: 20, padding: "6px 12px", color: "#fff", fontSize: 16 }}>↻</button>
                <button onClick={playNext} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 20 }}>⏭</button>
                <button onClick={toggleRepeat} style={{ background: "transparent", border: "none", color: repeatMode!== "off"? "#1DB954" : "#fff", fontSize: 18 }}>{repeatMode === "one"? "🔂" : "🔁"}</button>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <input type="range" min={0} max={1} step={0.01} value={volume} onChange={e => setVol(Number(e.target.value))} style={{ flex: 1 }} />
                <button onClick={downloadCurrent} style={{ background: "transparent", border: "1px solid #333", padding: "6px 12px", borderRadius: 20, fontSize: 12, color: "#fff" }}>⬇ Download</button>
                <select value={sleepTimer || ""} onChange={e => setSleepTimer(e.target.value? Number(e.target.value) : null)} style={{ background: "#222", color: "#fff", borderRadius: 20, padding: "4px 8px" }}><option value="">Sleep</option><option value="15">15m</option><option value="30">30m</option><option value="60">60m</option></select>
              </div>
            </div>
          )}
          {showQueue && (
            <div style={{ position: "fixed", inset: 0, top: "30%", background: "#18181b", zIndex: 110, borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 16, overflowY: "auto" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}><h3 style={{ color: "#fff" }}>Up Next</h3><button onClick={() => setShowQueue(false)} style={{ background: "transparent", border: "none", color: "#fff", fontSize: 16 }}>✕</button></div>
              {queue.map(t => <div key={t.externalId} onClick={() => playTrack(t)} style={{ display: "flex", gap: 10, padding: "8px 0", borderBottom: "1px solid #222", opacity: playing.externalId === t.externalId? 1 : 0.6 }}><img src={t.artworkUrl} style={{ width: 40, height: 40, borderRadius: 6 }} /><div><p style={{ color: "#fff", fontSize: 13 }}>{t.title}</p><p style={{ color: "#888", fontSize: 11 }}>{t.artist}</p></div></div>)}
            </div>
          )}
        </>
      )}
    </AudioContext.Provider>
  );
}
export const useAudio = () => useContext(AudioContext);
