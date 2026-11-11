import { formatShortMonth } from "@/lib/brava/date-utils";

/**
 * Navy header band shared by both slides — eyebrow + title + subtitle on a
 * gradient tank-farm photo, cutoff date and the BRAVA wordmark top-right.
 *
 * The wordmark below is a CSS approximation (bold italic text), not the
 * official vector logo — no logo asset exists in the project yet. Swap
 * <BravaWordmark/> for an <img> once Brava Energia provides the real file
 * (PNG or SVG, transparent background).
 */
export default function SlideHeader({
  eyebrow,
  title,
  subtitle,
  cutoffDateISO,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
  cutoffDateISO: string;
}) {
  return (
    <div className="relative h-[230px] w-full shrink-0 overflow-hidden" style={{ background: "var(--rp-blue)" }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--rp-blue) 0%, var(--rp-blue) 38%, rgba(26,5,114,0.72) 58%, rgba(26,5,114,0.28) 85%), url(/images/brava/hero-overview.jpg)",
          backgroundSize: "cover",
          backgroundPosition: "62% 42%",
        }}
      />
      <div className="relative z-10 flex h-full items-center justify-between px-[56px]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="h-[3px] w-[26px]" style={{ background: "var(--rp-accent)" }} />
            <span className="text-[14px] font-bold uppercase tracking-[0.18em] text-white">{eyebrow}</span>
          </div>
          <h1 className="mt-2 text-[52px] font-extrabold leading-[1.05] tracking-tight text-white">{title}</h1>
          <p className="mt-1 text-[19px] text-white/75">{subtitle}</p>
        </div>
        <div className="shrink-0 text-right">
          <BravaWordmark />
          <p className="mt-2 text-[16px] font-extrabold uppercase tracking-[0.12em]" style={{ color: "var(--rp-accent)" }}>
            Corte {formatShortMonth(cutoffDateISO)}
          </p>
        </div>
      </div>
    </div>
  );
}

function BravaWordmark() {
  return (
    <span
      className="inline-block text-[48px] font-black uppercase leading-none"
      style={{ color: "var(--rp-accent)", fontStyle: "italic", letterSpacing: "-0.01em", transform: "skewX(-6deg)" }}
    >
      Brava
    </span>
  );
}
