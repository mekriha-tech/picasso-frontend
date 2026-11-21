import Link from "next/link";
import ArtImage from "./ArtImage";
import { formatINR } from "@/lib/format";

const BADGES = { auction: "Auction", sale: "For sale", display: "On display", sold: "Sold" };

export default function ArtworkCard({ artwork, href }) {
  const price = formatINR(artwork.price ?? artwork.sold_price);
  return (
    <Link href={href ?? `/artworks/${artwork.slug}`} className="group block">
      <div className="aspect-[4/5] overflow-hidden bg-muted">
        <ArtImage
          src={artwork.primary_image_url}
          alt={artwork.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-foreground">{artwork.title}</h3>
          <p className="text-sm text-muted-foreground">{artwork.artist?.display_name}</p>
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <p className="uppercase tracking-wide">{BADGES[artwork.badge] ?? artwork.badge}</p>
          {price && <p className="mt-0.5 text-sm text-foreground">{price}</p>}
        </div>
      </div>
    </Link>
  );
}
