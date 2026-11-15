import Link from "next/link";
import ArtworkCard from "@/components/ArtworkCard";
import GatedAction from "@/components/GatedAction";
import SiteHeader from "@/components/home/SiteHeader";
import VrPreview from "@/components/home/VrPreview";
import { getLandingData } from "@/lib/catalogue-server";

export const metadata = { title: "Picasso — art auctions and virtual gallery" };

const btn = "rounded-full bg-primary px-5 py-2.5 text-sm text-primary-foreground";

export default async function LandingPage() {
  const { artworks } = await getLandingData();
  const items = artworks?.items ?? [];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SiteHeader
        right={
          <>
            <Link href="/login">Log in</Link>
            <Link href="/signup" className={btn}>
              Sign up
            </Link>
          </>
        }
      />
      <section className="mx-auto max-w-6xl px-6 py-24">
        <h1 className="max-w-2xl text-5xl font-medium leading-tight tracking-tight">
          Original art, auctioned and shown in a virtual gallery.
        </h1>
        <p className="mt-6 max-w-xl text-muted-foreground">
          Browse a selection below. Create a free account to see the full collection, bid, and enter the gallery.
        </p>
        <Link href="/signup" className={`${btn} mt-8 inline-block`}>
          Join Picasso
        </Link>
      </section>

      <section className="mx-auto max-w-6xl px-6 pb-20">
        <h2 className="mb-8 text-2xl font-medium tracking-tight">A first look</h2>
        {items.length === 0 ? (
          <p className="text-muted-foreground">The gallery is being prepared. Please check back soon.</p>
        ) : (
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 md:grid-cols-3 lg:grid-cols-4">
            {items.map((a) => (
              <ArtworkCard key={a.id} artwork={a} />
            ))}
          </div>
        )}
        <div className="mt-12 flex flex-col items-center gap-3 border-t border-border pt-10 text-center">
          <p className="text-muted-foreground">There is more to see. Log in to explore the full collection.</p>
          <Link href="/login?next=/home" className={btn}>
            Log in to see more
          </Link>
        </div>
      </section>

      <VrPreview cta={<GatedAction className={btn}>Enter the gallery</GatedAction>} />
      <footer className="border-t border-border py-8 text-center text-xs text-muted-foreground">© Picasso</footer>
    </div>
  );
}
