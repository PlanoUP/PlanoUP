export default function SectionHeading({
  eyebrow,
  title,
  subtitle,
  actions,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && (
          <p className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-brava-blue">{eyebrow}</p>
        )}
        <h2 className="text-[17px] font-bold tracking-tight text-brava-blue-dark sm:text-[19px]">{title}</h2>
        {subtitle && <p className="mt-1 text-[13px] text-brava-text-secondary">{subtitle}</p>}
      </div>
      {actions}
    </div>
  );
}
