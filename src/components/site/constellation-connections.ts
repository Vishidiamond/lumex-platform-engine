/**
 * Ordered draw sequences for each constellation's connecting lines.
 * Order matters — this is the visual choreography of the arrival.
 *
 * Each segment is a [startStarIdx, endStarIdx] pair indexing into the
 * constellation's `stars` array (see constellations3d.ts).
 *
 * The canonical "start" endpoint here is just the topology — at trigger
 * time the line-draw component picks the endpoint nearer to the camera
 * to be the actual visual start, so lines extend outward from a known
 * point into space.
 */

export interface ArrivalConfig {
  /** scrollProgress at which the draw sequence latches (slightly before camera settle). */
  triggerProgress: number;
  /** Per-segment draw duration in ms. */
  segmentDurationMs: number;
  /** Gap between consecutive segments in ms — gives the eye time to read each segment. */
  segmentGapMs: number;
  /** Ordered segments. */
  segments: ReadonlyArray<readonly [number, number]>;
}

/* ─────────────── Rails — 6 segments, single sweep ─────────────── */
const RAILS_SEGMENTS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6],
];

/* ─────────────── Sphere — 14 segments: equator → meridians → facets ─────────────── */
// Sphere geometry: 0 = core, 1..6 = ring1 (6), 7..16 = ring2 (10), 17..28 = ring3 (12).
const SPHERE_SEGMENTS: ReadonlyArray<readonly [number, number]> = [
  // Equator (5) — establishes volume first
  [7, 8], [8, 9], [9, 10], [10, 11], [11, 12],
  // Meridians (4) — pole-to-pole arcs through the core
  [1, 17], [2, 19], [3, 21], [4, 23],
  // Cross-connections forming facets (5)
  [1, 7], [2, 9], [3, 11], [7, 17], [9, 19],
];

/* ─────────────── Lattice — rows then columns ─────────────── */
// Lattice geometry: 7 cols × 4 rows = 28 stars, idx(c,r) = r*7 + c.
function buildLatticeSegments(): ReadonlyArray<readonly [number, number]> {
  const cols = 7;
  const rows = 4;
  const idx = (c: number, r: number) => r * cols + c;
  const segs: [number, number][] = [];
  // All horizontal rows first (top→bottom, left→right) — 4×6 = 24
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols - 1; c++) segs.push([idx(c, r), idx(c + 1, r)]);
  }
  // Then all vertical columns (left→right, top→bottom) — 7×3 = 21
  for (let c = 0; c < cols; c++) {
    for (let r = 0; r < rows - 1; r++) segs.push([idx(c, r), idx(c, r + 1)]);
  }
  return segs; // 45 total
}
const LATTICE_SEGMENTS = buildLatticeSegments();

/* ─────────────── House — sub-clusters then scaffold ─────────────── */
// House geometry: A=0..4 (5 stars), B=5..9 (5 stars), C=10..12 (3 stars), bridges 13,14.
const HOUSE_SEGMENTS: ReadonlyArray<readonly [number, number]> = [
  // Cluster A — Atelier Amara (5)
  [0, 1], [0, 2], [0, 3], [0, 4], [1, 4],
  // Cluster B — Fortunoff (5)
  [5, 6], [5, 7], [5, 8], [5, 9], [6, 9],
  // Cluster C — third sub-cluster (3 — limited by 3 stars available)
  [10, 11], [10, 12], [11, 12],
  // Scaffold — parent thesis, drawn last
  [0, 13], [13, 5], [5, 14], [14, 10],
];

export const ARRIVAL_CONFIGS: Record<"rails" | "sphere" | "lattice" | "house", ArrivalConfig> = {
  rails: {
    triggerProgress: 0.25,    // camera arrives at 0.28
    segmentDurationMs: 80,
    segmentGapMs: 30,
    segments: RAILS_SEGMENTS,
  },
  sphere: {
    triggerProgress: 0.43,    // camera arrives at 0.46
    segmentDurationMs: 70,
    segmentGapMs: 30,
    segments: SPHERE_SEGMENTS,
  },
  lattice: {
    triggerProgress: 0.61,    // camera arrives at 0.66 — earlier trigger; longest draw
    segmentDurationMs: 50,
    segmentGapMs: 30,
    segments: LATTICE_SEGMENTS,
  },
  house: {
    triggerProgress: 0.82,    // camera arrives at 0.86 — slow, terminal
    segmentDurationMs: 90,
    segmentGapMs: 30,
    segments: HOUSE_SEGMENTS,
  },
};

/** Total expected draw duration (ms) for a config. */
export function totalDurationMs(c: ArrivalConfig): number {
  if (c.segments.length === 0) return 0;
  return c.segments.length * c.segmentDurationMs + (c.segments.length - 1) * c.segmentGapMs;
}
