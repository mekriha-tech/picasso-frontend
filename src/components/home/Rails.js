"use client";

import Link from "next/link";
import { useState } from "react";
import ArtImage from "@/components/ArtImage";
import GatedAction from "@/components/GatedAction";
import { formatINR } from "@/lib/format";

const TAGS = { sale: "Sale", auction: "Bidding", display: "Showcase", sold: "Sold" };

export function Section({ title, action, children }) {
  return (
    <section className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-6 flex items-end justify-between gap-4">
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

export function Tabs({ tabs, active }) {
  return (
    <div className="mb-6 flex gap-6 text-sm">
      {tabs.map((t) => (
        <span
          key={t}
          aria-current={t === active}
          className={t === active ? "border-b-2 border-foreground pb-1" : "pb-1 text-muted-foreground"}
        >
          {t}
        </span>
      ))}
    </div>
  );
}

// Horizontal scroller, as in the design. Scrolls with touch, trackpad or keyboard.
export function Rail({ children, label }) {
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      className="flex snap-x gap-6 overflow-x-auto pb-4"
    >
      {children}
    </div>
  );
}

export function RailCard({ artwork }) {
  const price = formatINR(artwork.price ?? artwork.sold_price);
  const tag = artwork.sold ? TAGS.sold : (TAGS[artwork.listing_type] ?? artwork.badge);
  const [note, setNote] = useState(false);
  return (
    <article className="w-56 shrink-0 snap-start md:w-60">
      <Link href={`/artworks/${artwork.slug}`} className="relative block aspect-[4/5] overflow-hidden rounded-md bg-card">
        <ArtImage src={artwork.primary_image_url} alt={artwork.title} className="h-full w-full object-cover bg-card!" />
        <span className="absolute left-2 top-2 rounded bg-brand px-2 py-0.5 text-xs text-brand-foreground">
          {tag}
        </span>
      </Link>
      <div className="mt-2 flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{artwork.title}</h3>
          <p className="truncate text-xs text-muted-foreground">
            By{" "}
            <Link href={`/artists/${artwork.artist?.slug}`} className="hover:underline">
              {artwork.artist?.display_name}
            </Link>
          </p>
          <p className="mt-0.5 text-xs text-brand">{price ?? "Not for sale"}</p>
        </div>
        <div className="flex shrink-0 gap-1.5">
          <GatedAction
            onAllowed={() => setNote(true)}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-border-strong/60 text-xs"
          >
            <span className="sr-only">Add to wishlist</span>
            <span aria-hidden>♥</span>
          </GatedAction>
          <Link
            href={`/artworks/${artwork.slug}`}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-foreground text-xs text-background"
          >
            <span className="sr-only">View {artwork.title}</span>
            <span aria-hidden>↗</span>
          </Link>
        </div>
      </div>
      {note && (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          Wishlist is coming soon.
        </p>
      )}
    </article>
  );
}

// `className` sets the width: the default fits a horizontal rail, pass "w-full" inside a grid.
export function ArtistTile({ artist, className = "w-56 shrink-0 snap-start md:w-72" }) {
  const [note, setNote] = useState(false);
  return (
    <div className={className}>
      <Link href={`/artists/${artist.slug}`} className="block aspect-[4/5] overflow-hidden rounded-md bg-card">
        <ArtImage src={artist.cover_image_url} alt={artist.display_name} className="h-full w-full object-cover bg-card!" />
      </Link>
      <div className="mt-2 flex items-center justify-between gap-2">
        <div className="min-w-0">
          <Link href={`/artists/${artist.slug}`} className="block truncate text-sm font-semibold hover:underline">
            {artist.display_name}
          </Link>
          <p className="truncate text-xs text-muted-foreground">{artist.primary_medium}</p>
        </div>
        <GatedAction
          onAllowed={() => setNote(true)}
          className="rounded-md border border-border-strong px-4 py-1 text-xs"
        >
          Follow
        </GatedAction>
      </div>
      {note && (
        <p role="status" className="mt-1 text-xs text-muted-foreground">
          Following is coming soon.
        </p>
      )}
    </div>
  );
}

// For sections the backend cannot feed yet (auctions, exhibitions, testimonials).
export function ComingSoon({ children }) {
  return (
    <div className="rounded-lg border border-dashed border-border-strong px-6 py-10 text-center text-sm text-muted-foreground">
      {children}
    </div>
  );
}

export function HomeFooter() {
  return (
    <footer className="mt-10 border-t border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10 md:flex-row md:justify-between">
        <div className="max-w-sm">
          <p className="text-xl font-semibold text-brand">Picasso</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Where art finds its audience: collect, bid on and exhibit original work.
          </p>
        </div>
        <div className="flex gap-12 text-sm">
          {["Explore", "Join", "Support"].map((h) => (
            <div key={h}>
              <p className="font-semibold">{h}</p>
              <p className="mt-3 text-muted-foreground">Coming soon</p>
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto max-w-7xl px-6 pb-8 text-xs text-muted-foreground">
        © Picasso. All Rights Reserved.
      </p>
    </footer>
  );
}
