import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface Crumb {
  label: string;
  href?: string;
}

export default function PageHeader({
  crumbs,
  title,
  subtitle,
  actions,
}: {
  crumbs?: Crumb[];
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="sticky top-12 z-20 border-b border-brava-border bg-brava-white/95 backdrop-blur lg:top-0">
      <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-8">
        <div>
          {crumbs && crumbs.length > 0 && (
            <div className="mb-1 flex items-center gap-1.5 text-[12px] text-brava-text-secondary">
              {crumbs.map((c, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {c.href ? (
                    <Link href={c.href} className="hover:text-brava-blue">
                      {c.label}
                    </Link>
                  ) : (
                    <span>{c.label}</span>
                  )}
                  {i < crumbs.length - 1 && <ChevronRight className="h-3 w-3" />}
                </span>
              ))}
            </div>
          )}
          <h1 className="text-lg font-semibold tracking-tight text-brava-blue-dark sm:text-xl">
            {title}
          </h1>
          {subtitle && <p className="mt-0.5 text-[13px] text-brava-text-secondary">{subtitle}</p>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
