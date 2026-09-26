"use client";

export default function TrackRow({ item, subtitle, onPlay, onAdd, onShare, isPlaying }) {
  return (
    <div
      className="track-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 16px",
        borderBottom: "1px solid #1a1a1a",
      }}
    >
      <div
        onClick={onPlay}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: 1,
          cursor: "pointer",
          minWidth: 0,
        }}
      >
        <img
          src={item.artworkUrl}
          alt=""
          style={{ width: 48, height: 48, borderRadius: 6, objectFit: "cover" }}
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: "14px",
              fontWeight: 500,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: isPlaying ? "#1DB954" : "#fff",
            }}
          >
            {item.title}
          </div>
          <div
            style={{
              fontSize: "12px",
              color: "#8a8a8a",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {subtitle}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAdd();
          }}
          style={{
            background: "#2a2a2a",
            border: 0,
            width: 32,
            height: 32,
            borderRadius: "50%",
            color: "#fff",
            cursor: "pointer",
          }}
        >
          +
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
          style={{
            background: "transparent",
            border: 0,
            color: "#8a8a8a",
            cursor: "pointer",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="18" cy="5" r="3" />
            <circle cx="6" cy="12" r="3" />
            <circle cx="18" cy="19" r="3" />
            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
          </svg>
        </button>
      </div>
    </div>
  );
}