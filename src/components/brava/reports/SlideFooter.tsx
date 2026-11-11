export default function SlideFooter({ source, page }: { source: string; page: string }) {
  return (
    <div
      className="mt-auto flex shrink-0 items-center justify-between px-[56px] py-[12px] text-[12.5px]"
      style={{ background: "var(--rp-blue)" }}
    >
      <div className="flex items-center gap-2.5 text-white/80">
        <span className="h-[2px] w-[18px]" style={{ background: "var(--rp-accent)" }} />
        {source}
      </div>
      <span className="font-bold" style={{ color: "var(--rp-accent)" }}>
        {page}
      </span>
    </div>
  );
}
