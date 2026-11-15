// Look-and-feel preview of the VR gallery. PLACEHOLDER: a CSS-only drifting walk-through.
// Swap for a real short clip (<video autoPlay muted loop playsInline>) once design supplies one.
export default function VrPreview({ cta }) {
  return (
    <section className="bg-muted">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Virtual gallery</p>
          <h2 className="mt-3 text-3xl font-medium tracking-tight">Walk through the gallery</h2>
          <p className="mt-4 text-muted-foreground">
            Step inside a virtual exhibition and see the work at scale. Log in to enter.
          </p>
          <div className="mt-6">{cta}</div>
        </div>
        <div
          role="img"
          aria-label="Preview of the virtual gallery"
          className="relative aspect-video overflow-hidden rounded-xl bg-background shadow-sm"
        >
          <div className="vr-drift absolute inset-0 flex gap-6 p-6">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="mt-8 h-2/3 w-1/3 shrink-0 bg-muted" />
            ))}
          </div>
          <span className="absolute bottom-3 left-3 rounded bg-background px-2 py-1 text-xs text-muted-foreground">
            Preview
          </span>
        </div>
      </div>
    </section>
  );
}
