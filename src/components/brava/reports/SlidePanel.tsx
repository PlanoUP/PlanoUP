export default function SlidePanel({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col ${className ?? ""}`}>
      <div className="flex shrink-0 items-center gap-2.5 px-[16px] py-[9px]" style={{ background: "var(--rp-blue)" }}>
        <span className="h-[14px] w-[4px] shrink-0" style={{ background: "var(--rp-accent)" }} />
        <h3 className="text-[13.5px] font-bold uppercase tracking-wide text-white">{title}</h3>
      </div>
      <div className="min-h-0 flex-1 bg-white px-[16px] py-[14px]">{children}</div>
    </div>
  );
}
