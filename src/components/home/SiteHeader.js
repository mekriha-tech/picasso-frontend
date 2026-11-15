import Link from "next/link";

export default function SiteHeader({ right }) {
  return (
    <header className="border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="text-lg font-medium tracking-tight">
          Picasso
        </Link>
        <div className="flex items-center gap-4 text-sm">{right}</div>
      </div>
    </header>
  );
}
