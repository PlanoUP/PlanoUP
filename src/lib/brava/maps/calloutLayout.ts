// Lays out every in-maintenance progress callout for one map in a single
// pass, instead of each hotspot picking its own position independently.
// Two tanks that sit close together (common — e.g. adjacent lavagem-a-frio
// tanks) would otherwise get pushed in the same direction and their boxes
// would land on top of each other. This runs a small pairwise separation
// pass in the map's native image-pixel space so crowded clusters fan out
// instead of colliding.

export interface CalloutPoint {
  tag: string;
  xPct: number;
  yPct: number;
}

export interface CalloutOffset {
  dx: number;
  dy: number;
}

const BOX_WIDTH = 126;
const BOX_HEIGHT = 50;
const BOX_MARGIN = 20; // minimum gap enforced between two boxes
const BASE_DX = 60;
const BASE_DY = 46;
const RELAX_ITERATIONS = 64;
const MAX_OFFSET = 260; // clamp so a dense cluster can't fling a box far off-image

/**
 * Three starting angles within whichever quadrant a dot's position picks
 * (see signX/signY below) — diagonal, mostly-horizontal and
 * mostly-vertical. A tight cluster of 3+ tanks sharing the same quadrant
 * used to all start on the same diagonal line and just get pushed further
 * and further along it, stacking into a single column instead of fanning
 * out. Varying the angle per lane gives the relaxation pass genuinely
 * different starting directions to converge from.
 */
const LANE_ANGLES = [
  { dxMul: 1, dyMul: 1 },
  { dxMul: 1.5, dyMul: 0.55 },
  { dxMul: 0.55, dyMul: 1.5 },
];

export function hashTag(tag: string): number {
  let h = 0;
  for (let i = 0; i < tag.length; i++) h = (h * 31 + tag.charCodeAt(i)) >>> 0;
  return h;
}

function clamp(value: number, max: number): number {
  return Math.max(-max, Math.min(max, value));
}

export function computeCalloutLayout(
  points: CalloutPoint[],
  imageWidth: number,
  imageHeight: number
): Record<string, CalloutOffset> {
  const nodes = points.map((p) => {
    const signX = p.xPct > 62 ? -1 : 1;
    const signY = p.yPct < 20 ? 1 : -1;
    const { dxMul, dyMul } = LANE_ANGLES[hashTag(p.tag) % LANE_ANGLES.length];
    return {
      tag: p.tag,
      dotX: (p.xPct / 100) * imageWidth,
      dotY: (p.yPct / 100) * imageHeight,
      dx: signX * BASE_DX * dxMul,
      dy: signY * BASE_DY * dyMul,
    };
  });

  for (let iter = 0; iter < RELAX_ITERATIONS; iter++) {
    let moved = false;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i];
        const b = nodes[j];
        const ax = a.dotX + a.dx;
        const ay = a.dotY + a.dy;
        const bx = b.dotX + b.dx;
        const by = b.dotY + b.dy;
        const overlapX = BOX_WIDTH + BOX_MARGIN - Math.abs(ax - bx);
        const overlapY = BOX_HEIGHT + BOX_MARGIN - Math.abs(ay - by);
        if (overlapX <= 0 || overlapY <= 0) continue;

        moved = true;
        // Biased toward resolving horizontally: a vertical stack of boxes
        // eats far more of the map (and reads as "piled up") than the same
        // boxes spread left-right, so only fall back to a vertical push
        // when horizontal is a clearly worse option, not just marginally.
        if (overlapX < overlapY * 1.8) {
          const push = overlapX / 2 + 1;
          const sign = Math.sign(ax - bx) || 1;
          a.dx = clamp(a.dx + sign * push, MAX_OFFSET);
          b.dx = clamp(b.dx - sign * push, MAX_OFFSET);
        } else {
          const push = overlapY / 2 + 1;
          const sign = Math.sign(ay - by) || 1;
          a.dy = clamp(a.dy + sign * push, MAX_OFFSET);
          b.dy = clamp(b.dy - sign * push, MAX_OFFSET);
        }
      }
    }
    if (!moved) break;
  }

  return Object.fromEntries(nodes.map((n) => [n.tag, { dx: n.dx, dy: n.dy }]));
}
