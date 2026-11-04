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

// Convention-based fallback photo for the map's auto-tour panel, mirroring
// the video convention below: a fixed path per TAG, no table to maintain.
// Unlike getTankPhoto above (which backs <Image>, no onError handling),
// callers of this one are expected to probe it with a plain <img onError>
// and fall back gracefully — so, unlike TANK_PHOTOS, a tag with nothing at
// this path is the normal case, not an omission.
export function getTankTourPhotoSrc(tag: string): string {
  return `/images/brava/tanques/${tag.toUpperCase()}/1.jpg`;
}

// Small gallery convention for the map's per-tank mini dashboard — up to
// MAX_TOUR_GALLERY_PHOTOS numbered files per tag. Same graceful-degradation
// contract as getTankTourPhotoSrc: callers probe each with <img onError> and
// a tag with nothing beyond 1.jpg (or nothing at all) is the normal case.
export const MAX_TOUR_GALLERY_PHOTOS = 4;

export function getTankGalleryPhotoSrcs(tag: string): string[] {
  const upper = tag.toUpperCase();
  return Array.from({ length: MAX_TOUR_GALLERY_PHOTOS }, (_, i) => `/images/brava/tanques/${upper}/${i + 1}.jpg`);
}
