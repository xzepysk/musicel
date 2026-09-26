"use client";
import { useEffect, useState } from "react";

function formatTime(sec) {
  if (isNaN(sec) || !sec) return "0:00";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function PlayerBar({ track, audioRef, currentUrl, isPlaying, setIsPlaying }) {
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTime = () => {
      setCurrentTime(audio.currentTime);
      setDuration(audio.duration || 0);
      setProgress((audio.currentTime / (audio.duration || 1)) * 100);
    };

    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onTime);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onTime);
      audio.removeEventListener("ended", onEnded);
    };
  }, [audioRef, setIsPlaying, currentUrl]);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    try {
      if (isPlaying) {
        audio.pause();
        setIsPlaying(false);
      } else {
        await audio.play();
        setIsPlaying(true);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const seek = (e) => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audio.currentTime = pct * audio.duration;
  };

  if (!track) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 60,
        left: 0,
        right: 0,
        background: "#181818",
        borderTop: "1px solid #282828",
        padding: "10px 12px",
        zIndex: 100,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <audio ref={audioRef} src={currentUrl} crossOrigin="anonymous" style={{ display: "none" }} />
      <img src={track.artworkUrl} style={{ width: 48, height: 48, borderRadius: 4, objectFit: "cover" }} alt="" />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: "#b3b3b3",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {track.artist}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
          <span style={{ fontSize: 10, color: "#b3b3b3", minWidth: 32 }}>{formatTime(currentTime)}</span>
          <div onClick={seek} style={{ flex: 1, height: 4, background: "#404040", borderRadius: 2, cursor: "pointer" }}>
            <div style={{ width: `${progress}%`, height: "100%", background: "#1DB954", borderRadius: 2 }} />
          </div>
          <span style={{ fontSize: 10, color: "#b3b3b3", minWidth: 32 }}>{formatTime(duration)}</span>
        </div>
      </div>
      <button
        onClick={togglePlay}
        style={{
          width: 42,
          height: 42,
          borderRadius: "50%",
          background: "#fff",
          border: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          cursor: "pointer",
          flexShrink: 0,
        }}
      >
        {isPlaying ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="black">
            <path d="M8 5.14v14l11-7-11-7z" />
          </svg>
        )}
      </button>
    </div>
  );
}