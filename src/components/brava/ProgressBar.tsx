import { cn } from "@/lib/brava/cn";

export default function ProgressBar({
  value,
  accent = false,
  size = "md",
  className,
}: {
  value: number;
  /** Use the Brava accent color — reserve for the single "current" element on a screen. */
  accent?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "w-full overflow-hidden rounded-full bg-brava-border/60",
        size === "sm" ? "h-1.5" : "h-2",
        className
      )}
    >
      <div
        className={cn(
          "h-full rounded-full transition-[width] duration-500 ease-out",
          accent ? "bg-brava-accent" : "bg-brava-blue"
        )}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
