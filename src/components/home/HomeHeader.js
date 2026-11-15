"use client";

import Link from "next/link";
import { useState } from "react";

const EXPLORE = ["Artworks", "Auctions", "Upcoming Exhibition", "VR Gallery"];

// Account menu. Pages that are not built yet are shown but disabled, so the structure matches the
// design without linking to 404s. Viewers/buyers do not get the artist items.
function menuItems(isArtist) {
  const artist = isArtist ? ["My Artworks", "My Auctions", "My Exhibitions", "Stats"] : ["My Auctions"];
  return [...artist, "Order history", "Wishlist", "Settings"];
}

function initials(name) {
  return (name ?? "?")
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function HomeHeader({ user, isArtist, onSearch, onSignOut }) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [query, setQuery] = useState("");

  return (
    <header className="relative z-20 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-6 px-6">
        <Link href="/home" className="text-xl font-semibold tracking-tight text-brand">
          Picasso
        </Link>

        <nav className="hidden items-center gap-6 text-sm md:flex">
          <Link href="/home" className="text-brand">
            Home
          </Link>
          <div className="relative">
            <button
              type="button"
              aria-expanded={exploreOpen}
              onClick={() => setExploreOpen((o) => !o)}
              className="flex items-center gap-1"
            >
              Explore <span aria-hidden>▾</span>
            </button>
            {exploreOpen && (
              <ul className="absolute left-0 top-full mt-2 w-48 rounded-lg border border-border bg-popover p-2 text-sm shadow-md">
                {EXPLORE.map((item) => (
                  <li key={item} className="px-3 py-1.5 text-muted-foreground">
                    {item} <span className="text-xs">· soon</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <span className="text-muted-foreground">About</span>
          <span className="text-muted-foreground">Contact</span>
        </nav>

        <form
          role="search"
          className="ml-auto hidden max-w-md flex-1 md:block"
          onSubmit={(e) => {
            e.preventDefault();
            onSearch(query.trim());
          }}
        >
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search for Artworks, Artists, Medium etc."
            aria-label="Search artworks"
            className="w-full rounded-full border border-border bg-background px-4 py-2 text-sm"
          />
        </form>

        <div className="relative ml-auto md:ml-0">
          <button
            type="button"
            aria-label="Account menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-brand text-xs text-brand-foreground"
          >
            {user?.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials(user?.full_name)
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border border-border bg-popover p-3 text-sm shadow-md">
              <p className="font-medium">{user?.full_name}</p>
              <p className="mb-2 text-xs text-muted-foreground">{isArtist ? "Artist" : "Collector"}</p>
              <ul className="border-t border-border pt-2">
                {menuItems(isArtist).map((item) => (
                  <li key={item} className="px-1 py-1.5 text-muted-foreground">
                    {item} <span className="text-xs">· soon</span>
                  </li>
                ))}
                <li>
                  <button type="button" onClick={onSignOut} className="w-full px-1 py-1.5 text-left">
                    Logout
                  </button>
                </li>
              </ul>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
