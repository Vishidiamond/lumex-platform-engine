// Brand → constellation camera stops for the Phase 3 rig.
// Each stop defines where the camera sits and what it looks at, in world space.
// Position values mirror the constellation coordinates declared in Galaxy.tsx.

export type BrandStop = {
  id: string;
  label: string;
  // Constellation center in world space (must match Galaxy.tsx CONSTELLATIONS).
  target: [number, number, number];
  // Camera position relative to the target (offset added to target).
  offset: [number, number, number];
  // Short copy for the details panel. Intro stop has no tagline/blurb.
  tagline?: string;
  blurb?: string;
};


// Intro stop frames the full galaxy. Brand stops sit ~8 units in front of each
// constellation, slightly above, so the camera reads the cluster head-on.
export const BRAND_STOPS: BrandStop[] = [
  {
    id: "intro",
    label: "Galaxy",
    target: [0, 0, -12],
    offset: [0, 6, 38],
  },
  {
    id: "lumex_online",
    label: "Lumex.online",
    target: [18, 4, -6],
    offset: [0, 2, 9],
  },
  {
    id: "lumex",
    label: "Lumex",
    target: [-14, 7, -12],
    offset: [0, 2, 9],
  },
  {
    id: "nsphere",
    label: "Nsphere",
    target: [6, -9, -22],
    offset: [0, 2, 9],
  },
  {
    id: "atelier_amara",
    label: "Atelier Amara",
    target: [-8, 3, -30],
    offset: [0, 2, 9],
  },
  {
    id: "fortunoff",
    label: "Fortunoff",
    target: [22, 12, -26],
    offset: [0, 2, 9],
  },
];
