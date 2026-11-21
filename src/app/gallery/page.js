"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import SiteHeader from "@/components/home/SiteHeader";
import { initSession } from "@/lib/auth-api";
import { loginPath } from "@/lib/redirect";
import { VR_GALLERY } from "@/lib/vr-gallery";

// Logged-in only, as designed: logged-out visitors see the preview on the landing page and are
// sent to log in. Note this is a UI gate, not access control: the provider URL is public.
export default function GalleryPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let live = true;
    (async () => {
      const token = await initSession();
      if (!live) return;
      if (!token) router.replace(loginPath("/gallery"));
      else setReady(true);
    })();
    return () => {
      live = false;
    };
  }, [router]);

  return (
    <div className="min-h-screen bg-muted">
      <SiteHeader
        right={
          <Link href="/home" className="text-muted-foreground">
            ← Home
          </Link>
        }
      />
      <main className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="mb-6 text-3xl font-semibold tracking-tight md:text-4xl">VR Gallery</h1>
        {ready ? (
          // 60% of the width (min 324px) tall, matching the provider's embed code.
          <div className="relative h-0 w-full overflow-hidden rounded-lg bg-black pt-[max(60%,324px)]">
            <iframe
              src={VR_GALLERY.url}
              title={VR_GALLERY.title}
              className="absolute left-0 top-0 h-full w-full border-0"
              allow="fullscreen; autoplay"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
              sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-presentation"
            />
          </div>
        ) : (
          <p className="text-muted-foreground">Loading…</p>
        )}
        <p className="mt-4 text-sm text-muted-foreground">
          Use the controls inside the gallery to look around, or open it full screen.
        </p>
      </main>
    </div>
  );
}
