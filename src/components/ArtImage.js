"use client";

import { useState } from "react";

// Plain <img> rather than next/image: artwork URLs come from arbitrary hosts. Falls back to a
// neutral placeholder when the URL is missing or fails to load.
// The caller chooses the fit (object-cover for cropped cards, object-contain to show the whole
// image); `fallbackClassName` sizes the placeholder when there is no usable image.
export default function ArtImage({ src, alt, className = "", fallbackClassName = "" }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return (
      <div
        role="img"
        aria-label={alt}
        className={`flex items-center justify-center bg-muted text-xs text-muted-foreground ${className} ${fallbackClassName}`}
      >
        Image coming soon
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      loading="lazy"
      onError={() => setFailed(true)}
      className={className}
    />
  );
}
