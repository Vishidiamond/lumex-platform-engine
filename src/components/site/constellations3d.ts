import * as THREE from "three";

export type Vec3 = [number, number, number];

export interface Constellation3D {
  id: "rails" | "sphere" | "lattice" | "house";
  center: Vec3;
  /** Bright "named" stars in world space. */
  stars: Vec3[];
  /** Indices into `stars` describing connecting lines. */
  edges: [number, number][];
  /** Indices that should pulse at arrival. */
  hero: number[];
}

/** Rails — long ~150-unit run along +X around (300, 0, -200). */
function buildRails(): Constellation3D {
  const [cx, cy, cz] = [300, 0, -200];
  const n = 9;
  const span = 150;
  const stars: Vec3[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    stars.push([
      cx - span / 2 + t * span,
      cy + (i % 2 === 0 ? 2 : -3),
      cz + (i % 3 === 0 ? -8 : 6),
    ]);
  }
  // a couple of drift companions
  stars.push([cx - 50, cy + 30, cz - 25]);
  stars.push([cx + 40, cy - 25, cz + 20]);

  const edges: [number, number][] = [];
  for (let i = 0; i < n - 1; i++) edges.push([i, i + 1]);

  return { id: "rails", center: [cx, cy, cz], stars, edges, hero: [4] };
}

/** Sphere — clustered ~80-unit radius around (-200, 100, -400). */
function buildSphere(): Constellation3D {
  const [cx, cy, cz] = [-200, 100, -400];
  const stars: Vec3[] = [[cx, cy, cz]]; // core
  const rings = [
    { r: 32, n: 6 },
    { r: 56, n: 10 },
    { r: 78, n: 12 },
  ];
  rings.forEach((ring, idx) => {
    for (let i = 0; i < ring.n; i++) {
      const a = (i / ring.n) * Math.PI * 2 + idx * 0.25;
      const tilt = Math.sin(a + idx) * (10 + idx * 4);
      stars.push([
        cx + Math.cos(a) * ring.r,
        cy + Math.sin(a) * ring.r * 0.78 + tilt,
        cz + Math.sin(a * 1.3) * (ring.r * 0.4),
      ]);
    }
  });
  const edges: [number, number][] = [];
  // ring1 perimeter (1..6)
  for (let i = 0; i < 6; i++) edges.push([1 + i, 1 + ((i + 1) % 6)]);
  // spokes from core
  for (let i = 0; i < 6; i++) edges.push([0, 1 + i]);
  // ring1 -> ring2
  for (let i = 0; i < 6; i++) edges.push([1 + i, 7 + Math.floor((i / 6) * 10)]);
  // ring2 perimeter (7..16)
  for (let i = 0; i < 10; i++) edges.push([7 + i, 7 + ((i + 1) % 10)]);
  return { id: "sphere", center: [cx, cy, cz], stars, edges, hero: [0] };
}

/** Lattice — 7x4 flat grid ~120 units wide, around (100, -150, -700). */
function buildLattice(): Constellation3D {
  const [cx, cy, cz] = [100, -150, -700];
  const cols = 7;
  const rows = 4;
  const w = 120;
  const h = 60;
  const stepX = w / (cols - 1);
  const stepY = h / (rows - 1);
  const stars: Vec3[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      stars.push([cx - w / 2 + c * stepX, cy - h / 2 + r * stepY, cz]);
    }
  }
  const idx = (c: number, r: number) => r * cols + c;
  const edges: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (c < cols - 1) edges.push([idx(c, r), idx(c + 1, r)]);
      if (r < rows - 1) edges.push([idx(c, r), idx(c, r + 1)]);
      if (c < cols - 1 && r < rows - 1) edges.push([idx(c, r), idx(c + 1, r + 1)]);
    }
  }
  return { id: "lattice", center: [cx, cy, cz], stars, edges, hero: [0, cols - 1, cols * rows - 1] };
}

/** House — three sub-clusters across ~200 units around (-100, 50, -1000). */
function buildHouse(): Constellation3D {
  const [cx, cy, cz] = [-100, 50, -1000];
  const stars: Vec3[] = [];

  // cluster A (Atelier Amara) — left
  const a: Vec3 = [cx - 90, cy + 20, cz];
  stars.push(a);
  stars.push([a[0] - 25, a[1] + 18, a[2] + 8]);
  stars.push([a[0] + 22, a[1] - 12, a[2] - 6]);
  stars.push([a[0] - 8, a[1] - 28, a[2] + 5]);
  stars.push([a[0] + 18, a[1] + 28, a[2] - 10]);

  // cluster B (Fortunoff) — center
  const b: Vec3 = [cx + 10, cy + 5, cz - 8];
  stars.push(b);
  stars.push([b[0] - 22, b[1] - 18, b[2] + 6]);
  stars.push([b[0] + 24, b[1] - 14, b[2] - 4]);
  stars.push([b[0] + 4, b[1] - 32, b[2] + 8]);
  stars.push([b[0] + 30, b[1] + 22, b[2] + 2]);

  // cluster C (More to come) — right, faint
  const c: Vec3 = [cx + 95, cy - 10, cz + 6];
  stars.push(c);
  stars.push([c[0] - 22, c[1] - 22, c[2] - 4]);
  stars.push([c[0] + 26, c[1] - 18, c[2] + 8]);

  // bridges
  stars.push([cx - 40, cy + 6, cz + 4]); // 13
  stars.push([cx + 50, cy - 4, cz - 2]); // 14

  const edges: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [0, 4],
    [5, 6], [5, 7], [5, 8], [5, 9],
    [10, 11], [10, 12],
    [0, 13], [13, 5], [5, 14], [14, 10],
  ];
  return { id: "house", center: [cx, cy, cz], stars, edges, hero: [0, 5, 10] };
}

export const CONSTELLATIONS: Constellation3D[] = [
  buildRails(),
  buildSphere(),
  buildLattice(),
  buildHouse(),
];

export const CONSTELLATION_BY_ID: Record<Constellation3D["id"], Constellation3D> = {
  rails: CONSTELLATIONS[0],
  sphere: CONSTELLATIONS[1],
  lattice: CONSTELLATIONS[2],
  house: CONSTELLATIONS[3],
};

export function v(c: Vec3) {
  return new THREE.Vector3(c[0], c[1], c[2]);
}
