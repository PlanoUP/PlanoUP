export default function MaintenanceEventTicker({ items }: { items: string[] }) {
  if (items.length === 0) return null;
  // Duplicated once so the -50% loop point lands exactly where the content repeats, however wide it is.
  const track = [...items, ...items];

  return (
    <div className="pointer-events-none absolute inset-x-0 top-32 z-20 overflow-hidden border-y border-white/10 bg-black/50 py-1.5 backdrop-blur-sm">
      <div className="flex w-max animate-marquee items-center gap-10 whitespace-nowrap px-6">
        {track.map((item, i) => (
          <span key={i} className="text-[11px] font-semibold uppercase tracking-wide text-white/80">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
