import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { sceneState } from "@/lib/scene-state";
import { CONSTELLATIONS } from "./constellations3d";
import { BEAT10 } from "./camera-config";

/**
 * Inter-constellation scaffolding — four lines connecting the brightest star
 * of each constellation into a quadrilateral: Rails ↔ Sphere ↔ Lattice ↔ House
 * ↔ Rails. Triggers at scrollProgress = 0.94 during sub-stage B (the lift).
 *
 * All four lines draw SIMULTANEOUSLY over 1.8s — not sequentially.
 * Color: #6b8cae at 0.35 base opacity, glow peak 0.6 at midpoint, settle to 0.35.
 *
 * Once drawn, never erases. Reduced motion snaps to fully drawn at trigger.
 */
const COLOR = new THREE.Color("#6b8cae");
const BASE_OPACITY = 0.35;
const GLOW_PEAK = 0.6;

export function ScaffoldLines({ reduceMotion }: { reduceMotion: boolean }) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const triggeredAt = useRef<number | null>(null);

  const segments = useMemo(() => {
    // brightest star = stars[hero[0]] for each constellation, in journey order
    const order: ("rails" | "sphere" | "lattice" | "house")[] = ["rails", "sphere", "lattice", "house"];
    const points = order.map((id) => {
      const c = CONSTELLATIONS.find((x) => x.id === id)!;
      return c.stars[c.hero[0]];
    });
    // Closing the loop: rails→sphere, sphere→lattice, lattice→house, house→rails
    return [
      [points[0], points[1]],
      [points[1], points[2]],
      [points[2], points[3]],
      [points[3], points[0]],
    ] as const;
  }, []);

  const { positions, geom } = useMemo(() => {
    const n = segments.length;
    const positions = new Float32Array(n * 6);
    for (let i = 0; i < n; i++) {
      const [a] = segments[i];
      // Initialize collapsed at the start point
      positions[i * 6 + 0] = a[0]; positions[i * 6 + 1] = a[1]; positions[i * 6 + 2] = a[2];
      positions[i * 6 + 3] = a[0]; positions[i * 6 + 4] = a[1]; positions[i * 6 + 5] = a[2];
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return { positions, geom: g };
  }, [segments]);

  useFrame(() => {
    const p = scrollStore.get();
    const mat = matRef.current;
    if (!mat) return;

    if (triggeredAt.current === null && p >= BEAT10.scaffoldTrigger) {
      triggeredAt.current = performance.now();
      // Choose drawing direction per segment: nearer endpoint to camera = visual start
      // (handled inline below by swapping if needed at trigger time).
      const cx = sceneState.cameraPos.x;
      const cy = sceneState.cameraPos.y;
      const cz = sceneState.cameraPos.z;
      for (let i = 0; i < segments.length; i++) {
        const [a, b] = segments[i];
        const da = (a[0]-cx)**2 + (a[1]-cy)**2 + (a[2]-cz)**2;
        const db = (b[0]-cx)**2 + (b[1]-cy)**2 + (b[2]-cz)**2;
        const start = da <= db ? a : b;
        positions[i*6+0] = start[0]; positions[i*6+1] = start[1]; positions[i*6+2] = start[2];
        positions[i*6+3] = start[0]; positions[i*6+4] = start[1]; positions[i*6+5] = start[2];
      }
      geom.attributes.position.needsUpdate = true;
    }

    if (triggeredAt.current === null) {
      mat.visible = false;
      return;
    }

    const elapsed = performance.now() - triggeredAt.current;
    const t = reduceMotion ? 1 : Math.min(1, elapsed / BEAT10.scaffoldDurationMs);

    // Animate all 4 segment endpoints in lockstep.
    let dirty = false;
    for (let i = 0; i < segments.length; i++) {
      const [a, b] = segments[i];
      // Determine current start (the one we already wrote at trigger)
      const off = i * 6;
      const sx = positions[off + 0], sy = positions[off + 1], sz = positions[off + 2];
      // End candidate is whichever of a/b is NOT the start
      const isStartA = sx === a[0] && sy === a[1] && sz === a[2];
      const e = isStartA ? b : a;
      const tx = sx + (e[0] - sx) * t;
      const ty = sy + (e[1] - sy) * t;
      const tz = sz + (e[2] - sz) * t;
      if (positions[off+3] !== tx || positions[off+4] !== ty || positions[off+5] !== tz) {
        positions[off+3] = tx; positions[off+4] = ty; positions[off+5] = tz;
        dirty = true;
      }
    }
    if (dirty) geom.attributes.position.needsUpdate = true;

    // Glow envelope: 0 → peak (0.6) at midpoint → settle (0.35)
    let opacityTarget: number;
    if (t <= 0) opacityTarget = 0;
    else if (t >= 1) opacityTarget = BASE_OPACITY;
    else {
      const bump = 1 - Math.abs(t - 0.5) * 2; // 0 at edges, 1 at midpoint
      opacityTarget = BASE_OPACITY + (GLOW_PEAK - BASE_OPACITY) * bump;
    }
    mat.opacity += (opacityTarget - mat.opacity) * 0.18;
    mat.visible = mat.opacity > 0.005;
  });

  return (
    <lineSegments frustumCulled={false} renderOrder={1}>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        ref={matRef}
        color={COLOR}
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}
