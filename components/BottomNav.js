"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  search: (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  ),
  library: (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="2" />
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="2" />
    </svg>
  ),
  profile: (
    <svg width="23" height="23" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
      <path d="M4 20c0-4 3.6-6 8-6s8 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
};

const TABS = [
  { href: "/", label: "Search", icon: "search" },
  { href: "/playlist", label: "Playlist", icon: "library" },
  { href: "/profile", label: "Profile", icon: "profile" }
];

export default function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="bottom-nav">
      {TABS.map((tab) => {
        const active = tab.href === "/" ? pathname === "/" : pathname.startsWith(tab.href);
        return (
          <Link key={tab.href} href={tab.href} className={`nav-item ${active ? "active" : ""}`}>
            {ICONS[tab.icon]}
            <span>{tab.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
