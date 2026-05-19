import type { Vector3Tuple } from "three";

export type ConstellationId =
  | "lumex"
  | "lumex-online"
  | "nsphere"
  | "atelier-amara"
  | "fortunoff";

export type ConstellationRoute =
  | "/lumex"
  | "/lumex-online"
  | "/nsphere"
  | "/atelier-amara"
  | "/fortunoff";

export type Constellation = {
  id: ConstellationId;
  name: string;
  route: ConstellationRoute;
  glb: string;
  position: Vector3Tuple;
  tagline: string;
  blurb: string;
};

// Canonical brand → constellation mapping. Positions are in world space and
// CameraController animates camera.position + controls.target toward them.
export const CONSTELLATIONS: Constellation[] = [
  {
    id: "lumex",
    name: "Lumex",
    route: "/lumex",
    glb: "/assets/orion.glb",
    position: [6, -9, -22],
    tagline: "The AI design engine",
    blurb:
      "Proprietary AI that designs jewelry end-to-end — from stone selection to render-ready CAD — at a scale the craft has never seen.",
  },
  {
    id: "lumex-online",
    name: "Lumex.Online",
    route: "/lumex-online",
    glb: "/assets/aquarius.glb",
    position: [18, 4, -6],
    tagline: "The trading platform",
    blurb:
      "A live marketplace where the world's diamond inventory becomes searchable, comparable, and tradable in real time.",
  },
  {
    id: "nsphere",
    name: "Nsphere",
    route: "/nsphere",
    glb: "/assets/cygnus.glb",
    position: [-14, 7, -12],
    tagline: "The data backbone",
    blurb:
      "The intelligence layer powering every Lumex division: pricing, provenance, and demand signals unified into one graph.",
  },
  {
    id: "atelier-amara",
    name: "Atelier Amara",
    route: "/atelier-amara",
    glb: "/assets/phoenix.glb",
    position: [-8, 3, -30],
    tagline: "The contemporary house",
    blurb:
      "An in-house brand built for a new generation of jewelry buyers — design-led, digitally native, quietly luxurious.",
  },
  {
    id: "fortunoff",
    name: "Fortunoff",
    route: "/fortunoff",
    glb: "/assets/ursa_major.glb",
    position: [22, 12, -26],
    tagline: "The heritage house",
    blurb:
      "A storied American jeweler, reimagined with Lumex's design engine and supply chain at its core.",
  },
];

export const CONSTELLATIONS_BY_ID = Object.fromEntries(
  CONSTELLATIONS.map((c) => [c.id, c]),
) as Record<ConstellationId, Constellation>;
