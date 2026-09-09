// Single central TAG → real photograph mapping, shared by every part of the
// system that shows a tank photo (Hero, the individual dashboard, the asset
// map drawer, etc.) — never duplicate this table elsewhere.
//
// Only TAGs with a confirmed, identifiable photo are listed here. The
// WhatsApp/ChatGPT reference images already in the repo show real Brava
// tanks under maintenance but without a reliable way to confirm which TAG
// each one depicts, so they are intentionally left out rather than guessed.

export const TANK_PHOTOS: Record<string, string> = {
  "TQ-41008": "/images/brava/hero-tq-41008.jpg",
};

export function getTankPhoto(tag: string): string | null {
  return TANK_PHOTOS[tag.toUpperCase()] ?? null;
}
