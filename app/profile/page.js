"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import BottomNav from "../../components/BottomNav";

export default function ProfilePage() {
  const { data: session, status } = useSession();

  return (
    <div className="app-shell">
      <div className="topbar">
        <div className="brand">
          <span className="brand-name">Profile</span>
        </div>
      </div>

      {status === "loading" && <p style={{ color: "var(--text-dim)", padding: 16 }}>Loading…</p>}

      {status === "unauthenticated" && (
        <div className="profile-card">
          <div className="profile-avatar" />
          <div className="profile-name">Not signed in</div>
          <p style={{ color: "var(--text-dim)", fontSize: 14, marginTop: 6 }}>
            Sign in with Google to save and share playlists.
          </p>
          <button className="google-btn" onClick={() => signIn("google")}>
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path
                fill="#FFC107"
                d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
              />
              <path
                fill="#FF3D00"
                d="M6.3 14.7l6.6 4.8C14.7 15.9 18.9 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.6 6.1 29.6 4 24 4c-7.7 0-14.3 4.3-17.7 10.7z"
              />
              <path
                fill="#4CAF50"
                d="M24 44c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.4C29.6 35.4 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8H6v6.2C9.4 39.7 16.1 44 24 44z"
              />
              <path
                fill="#1976D2"
                d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.5l6.6 5.4C40.4 36.4 44 30.7 44 24c0-1.3-.1-2.7-.4-3.5z"
              />
            </svg>
            Sign in with Google
          </button>
        </div>
      )}

      {status === "authenticated" && (
        <div className="profile-card">
          {session.user.image ? (
            <img className="profile-avatar" src={session.user.image} alt="" />
          ) : (
            <div className="profile-avatar" />
          )}
          <div className="profile-name">{session.user.name}</div>
          <div className="profile-email">{session.user.email}</div>
          <button className="btn-ghost" style={{ marginTop: 18 }} onClick={() => signOut()}>
            Sign out
          </button>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
