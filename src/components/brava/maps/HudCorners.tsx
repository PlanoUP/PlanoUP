/**
 * Purely decorative corner brackets framing the fullscreen viewport —
 * signals "control room HUD" without adding any interactive surface.
 * Positioned against the viewport (fullscreenRef), not the aspect-ratio
 * box, so it frames the screen itself regardless of letterboxing.
 */
export default function HudCorners() {
  const base = "pointer-events-none absolute h-8 w-8 border-brava-accent/60 sm:h-10 sm:w-10";
  return (
    <>
      <span className={`${base} left-4 top-4 border-l-2 border-t-2`} />
      <span className={`${base} right-4 top-4 border-r-2 border-t-2`} />
      <span className={`${base} bottom-4 left-4 border-b-2 border-l-2`} />
      <span className={`${base} bottom-4 right-4 border-b-2 border-r-2`} />
    </>
  );
}
