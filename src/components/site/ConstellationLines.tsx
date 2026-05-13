import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { sceneState } from "@/lib/scene-state";
import { CONSTELLATIONS, type Constellation3D } from "./constellations3d";
import {
  ARRIVAL_CONFIGS,
  totalDurationMs,
  type ArrivalConfig,
} from "./constellation-connections";

/**
 * Progressive line-drawing for one constellation's arrival.
 *
 * Implementation:
 * - All segments share a single LineSegments mesh (N×2 verts) for perf.
 * - Each segment grows from its near-to-camera endpoint outward by mutating
 *   the END vertex's position (lerp from start → end as segment progress 0→1).
 * - Per-segment alpha is encoded in vertex colors so we can give each segment
 *   a midpoint glow (1.3× → 0.6 settle) without N materials.
 * - Trigger latches once when scrollProgress crosses `triggerProgress`. Lines
 *   never erase — the journey accumulates.
 * - Reduced-motion: lines snap to fully drawn at trigger.
 */

const BASE_COLOR = new THREE.Color("#6b8cae");
const BASE_ALPHA = 0.6;
const GLOW_PEAK = 1.3 / 0.6; // multiplier on BASE_ALPHA at the midpoint of a segment's draw

interface SegmentRuntime {
  startIdx: number;
  endIdx: number;
  /** Cached world-space positions of the two endpoints. */
  ax: number; ay: number; az: number;
  bx: number; by: number; bz: number;
  /** Sequence index → drives stagger timing. */
  seq: number;
  /** Decided at trigger: which endpoint is the "start" (nearer to camera). */
  startIsA: boolean;
}

function ConstellationLineGroup({
  con,
  config,
  reduceMotion,
}: {
  con: Constellation3D;
  config: ArrivalConfig;
  reduceMotion: boolean;
}) {
  const matRef = useRef<THREE.LineBasicMaterial>(null);
  const triggeredAt = useRef<number | null>(null);

  // Pre-compute segment runtime data. Positions don't change after mount.
  const runtime = useMemo<SegmentRuntime[]>(() => {
    return config.segments.map(([a, b], seq) => {
      const sa = con.stars[a];
      const sb = con.stars[b];
      return {
        startIdx: a,
        endIdx: b,
        ax: sa[0], ay: sa[1], az: sa[2],
        bx: sb[0], by: sb[1], bz: sb[2],
        seq,
        startIsA: true,
      };
    });
  }, [con, config.segments]);

  // Pre-allocated position + color buffers (2 verts per segment).
  const { positions, colors, geom } = useMemo(() => {
    const n = runtime.length;
    const positions = new Float32Array(n * 6);
    const colors = new Float32Array(n * 6);
    // Initialize: both verts collapsed at endpoint A; alpha 0 (encoded into RGB).
    for (let i = 0; i < n; i++) {
      const r = runtime[i];
      positions[i * 6 + 0] = r.ax;
      positions[i * 6 + 1] = r.ay;
      positions[i * 6 + 2] = r.az;
      positions[i * 6 + 3] = r.ax;
      positions[i * 6 + 4] = r.ay;
      positions[i * 6 + 5] = r.az;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return { positions, colors, geom: g };
  }, [runtime]);

  useFrame(() => {
    const p = scrollStore.get();
    const mat = matRef.current;
    if (!mat) return;

    // Latch on first crossing of trigger.
    if (triggeredAt.current === null && p >= config.triggerProgress) {
      triggeredAt.current = performance.now();
      // Lock in drawing direction now (nearer endpoint to camera = visual start).
      const cx = sceneState.cameraPos.x;
      const cy = sceneState.cameraPos.y;
      const cz = sceneState.cameraPos.z;
      for (const r of runtime) {
        const da = (r.ax - cx) ** 2 + (r.ay - cy) ** 2 + (r.az - cz) ** 2;
        const db = (r.bx - cx) ** 2 + (r.by - cy) ** 2 + (r.bz - cz) ** 2;
        r.startIsA = da <= db;
      }
      // Publish to scene-state so per-star pulses can sync to segment completions.
      sceneState.arrivalTriggers[con.id] = triggeredAt.current;
    }

    if (triggeredAt.current === null) return;

    const now = performance.now();
    const elapsed = now - triggeredAt.current;
    const stride = config.segmentDurationMs + config.segmentGapMs;

    let posDirty = false;
    let colDirty = false;
    let allDone = true;

    for (let i = 0; i < runtime.length; i++) {
      const r = runtime[i];
      const segStart = r.seq * stride;
      const segEnd = segStart + config.segmentDurationMs;

      let t: number; // 0..1 draw progress
      if (reduceMotion) {
        t = 1;
      } else if (elapsed < segStart) {
        t = 0;
        allDone = false;
      } else if (elapsed >= segEnd) {
        t = 1;
      } else {
        t = (elapsed - segStart) / config.segmentDurationMs;
        allDone = false;
      }

      // Pick visual start/end based on latched direction.
      const sx = r.startIsA ? r.ax : r.bx;
      const sy = r.startIsA ? r.ay : r.by;
      const sz = r.startIsA ? r.az : r.bz;
      const ex = r.startIsA ? r.bx : r.ax;
      const ey = r.startIsA ? r.by : r.ay;
      const ez = r.startIsA ? r.bz : r.az;

      const tx = sx + (ex - sx) * t;
      const ty = sy + (ey - sy) * t;
      const tz = sz + (ez - sz) * t;

      const off = i * 6;
      // Vertex 0 — always at the start point.
      if (positions[off + 0] !== sx || positions[off + 1] !== sy || positions[off + 2] !== sz) {
        positions[off + 0] = sx;
        positions[off + 1] = sy;
        positions[off + 2] = sz;
        posDirty = true;
      }
      // Vertex 1 — animated tip.
      if (positions[off + 3] !== tx || positions[off + 4] !== ty || positions[off + 5] !== tz) {
        positions[off + 3] = tx;
        positions[off + 4] = ty;
        positions[off + 5] = tz;
        posDirty = true;
      }

      // Per-segment alpha encoded as RGB scale. Vertex color is multiplied by
      // material color; alpha comes from the material side at constant 1.
      // We get per-segment "alpha" by scaling the color toward black before draw,
      // and full BASE_COLOR after a settle. Glow peaks at midpoint.
      let alphaScale: number;
      if (t <= 0) {
        alphaScale = 0;
      } else if (t >= 1) {
        alphaScale = 1; // settled at BASE_ALPHA (carried by material.opacity)
      } else {
        // Triangle bump centered at t=0.5 reaches GLOW_PEAK; clamps to ≥ t (so the
        // freshly-drawn portion is at least visible).
        const bump = 1 + (GLOW_PEAK - 1) * (1 - Math.abs(t - 0.5) * 2);
        alphaScale = Math.max(t, bump * t);
      }
      // Encode scaled color into both vertex colors.
      const cr = BASE_COLOR.r * alphaScale;
      const cg = BASE_COLOR.g * alphaScale;
      const cb = BASE_COLOR.b * alphaScale;
      if (colors[off + 0] !== cr) colDirty = true;
      colors[off + 0] = cr; colors[off + 1] = cg; colors[off + 2] = cb;
      colors[off + 3] = cr; colors[off + 4] = cg; colors[off + 5] = cb;
    }

    if (posDirty) geom.attributes.position.needsUpdate = true;
    if (colDirty) geom.attributes.color.needsUpdate = true;

    // Once everything is drawn, freeze updates by leaving triggeredAt set.
    if (allDone) {
      // no-op — we keep the buffers as-is (lines accumulated, no erase on back-scroll)
    }
  });

  return (
    <lineSegments frustumCulled={false} renderOrder={2}>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={BASE_ALPHA}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        toneMapped={false}
      />
    </lineSegments>
  );
}

export function AllConstellationLines({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      {CONSTELLATIONS.map((con) => {
        const config = ARRIVAL_CONFIGS[con.id];
        return (
          <ConstellationLineGroup
            key={con.id}
            con={con}
            config={config}
            reduceMotion={reduceMotion}
          />
        );
      })}
    </>
  );
}

/** Exported for diagnostics / audit. */
export function arrivalDiagnostics() {
  return (Object.keys(ARRIVAL_CONFIGS) as Array<keyof typeof ARRIVAL_CONFIGS>).map((k) => {
    const c = ARRIVAL_CONFIGS[k];
    return {
      id: k,
      segments: c.segments.length,
      triggerProgress: c.triggerProgress,
      totalMs: totalDurationMs(c),
    };
  });
}
