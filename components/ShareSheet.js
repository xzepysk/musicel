"use client";

import { useState } from "react";

export default function ShareSheet({ title, url, onClose }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  }

  async function nativeShare() {
    if (navigator.share) {
      try {
        await navigator.share({ title: "XamusiceL", text: title, url });
      } catch {}
    } else {
      copy();
    }
  }

  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <h4>Share "{title}"</h4>
        <input className="sheet-input" readOnly value={url} onFocus={(e) => e.target.select()} />
        <button className="btn-primary" onClick={nativeShare} style={{ marginBottom: 8 }}>
          Share…
        </button>
        <button className="btn-ghost" onClick={copy}>
          {copied ? "Copied!" : "Copy link"}
        </button>
      </div>
    </div>
  );
}
