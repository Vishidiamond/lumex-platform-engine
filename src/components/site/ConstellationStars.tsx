import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { sceneState } from "@/lib/scene-state";
import { scrollStore } from "@/lib/scroll-store";
import { type Constellation3D, CONSTELLATIONS } from "./constellations3d";
import { ARRIVAL_CONFIGS } from "./constellation-connections";

/**
 * Per-star punctuation pulses fired on line-segment completion.
 *
 * Each constellation renders its named stars as individual meshes (not
 * instanced) so per-star scale, color brightness, and a billboard halo can
 * be animated independently. 62 meshes total across the four constellations.
 *
 * Pulse mechanics:
 * - Trigger: ConstellationLines latches at scrollProgress crossing and writes
 *   `sceneState.arrivalTriggers[id]`. We compute segment completion times
 *   (seq * stride + segmentDurationMs) and spawn a pulse on each segment's
 *   destination star (the endpoint farther from the camera at trigger time —
 *   matches the line-draw direction).
 * - Envelope: fast attack (ease-out-quint, 0→peakAt) then slow decay
 *   (ease-in-out-cubic, peakAt→duration).
 * - Stacking: when a star receives multiple overlapping pulses, scale and
 *   brightness sum, capped to prevent runaway accumulation.
 * - Reduced-motion: pulse spawning is gated off entirely.
 */

const BASE_COLOR = new THREE.Color("#eaf1ff");
const STAR_GEO = new THREE.SphereGeometry(1, 12, 8);

const SCALE_CAP_ADD = 0.7; // → max scale 1.7
const EMISSIVE_CAP_ADD = 2.5; // → max color brightness 3.5×
const HALO_OPACITY_CAP = 1.0;

interface PulseParams {
  duration: number;
  peakAt: number;
  scalePeakAdd: number; // peak = 1 + this
  emissivePeakAdd: number; // peak = 1 + this
  haloOpacityPeak: number;
  haloScalePeak: number;
  haloScaleEnd: number;
}

const DEFAULT_PARAMS: PulseParams = {
  duration: 320,
  peakAt: 80,
  scalePeakAdd: 0.45, // → 1.45×
  emissivePeakAdd: 1.6, // → 2.6×
  haloOpacityPeak: 0.7,
  haloScalePeak: 1.0,
  haloScaleEnd: 1.4,
};

const LATTICE_PARAMS: PulseParams = {
  duration: 240,
  peakAt: 60,
  scalePeakAdd: 0.30, // → 1.30×
  emissivePeakAdd: 1.2, // → 2.2×
  haloOpacityPeak: 0.55,
  haloScalePeak: 0.95,
  haloScaleEnd: 1.3,
};

const HOUSE_SCAFFOLD_PARAMS: PulseParams = {
  duration: 360,
  peakAt: 90,
  scalePeakAdd: 0.55, // → 1.55×
  emissivePeakAdd: 2.0, // → 3.0×
  haloOpacityPeak: 0.85,
  haloScalePeak: 1.1,
  haloScaleEnd: 1.55,
};

const PARAMS_BY_ID: Record<Constellation3D["id"], PulseParams> = {
  rails: DEFAULT_PARAMS,
  sphere: DEFAULT_PARAMS,
  lattice: LATTICE_PARAMS,
  house: DEFAULT_PARAMS,
};

// (FORESHADOW_EASE removed — strategies use local easeOutQuint/easeInOutCubic.)

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5);
}
function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function pulseEnvelope(t: number, peakAt: number, duration: number): number {
  if (t <= 0) return 0;
  if (t >= duration) return 0;
  if (t <= peakAt) return easeOutQuint(t / peakAt);
  return 1 - easeInOutCubic((t - peakAt) / (duration - peakAt));
}

/* ─────────────── Per-constellation foreshadowing strategies ─────────────── */

/** scrollProgress at which each constellation's foreshadow fires (one-shot, forward). */
const FORESHADOW_TRIGGERS: Record<Constellation3D["id"], number> = {
  rails: -1, // Rails is the first arrival; no transit foreshadow.
  sphere: 0.42,
  lattice: 0.62,
  house: 0.82,
};

const FORESHADOW_REARM_HYSTERESIS = 0.02;

/** Reduced-motion fallback: single 200ms uniform 1.4× bump. */
function applyForeshadowReducedMotion(elapsed: number, out: Float32Array): boolean {
  const dur = 200;
  if (elapsed >= dur) return false;
  const env = elapsed < 50 ? elapsed / 50 : Math.max(0, 1 - (elapsed - 50) / 150);
  const add = 0.4 * env;
  for (let i = 0; i < out.length; i++) out[i] += add;
  return true;
}

/**
 * Per-constellation strategy. Adds multiplicative *additions* to `out[i]`
 * (final star multiplier = 1 + out[i]). Returns false when the envelope is
 * fully spent so the caller can release the trigger.
 */
function applyForeshadow(
  con: Constellation3D,
  elapsed: number,
  reduceMotion: boolean,
  out: Float32Array,
): boolean {
  if (reduceMotion) return applyForeshadowReducedMotion(elapsed, out);

  switch (con.id) {
    case "sphere": {
      // Uniform glow: peak 1.4× at ~150ms, full envelope 700ms.
      const totalDur = 700;
      if (elapsed >= totalDur + 100) return false; // small grace tail
      const uniformEnv = pulseEnvelope(elapsed, 150, totalDur);
      const uniformAdd = 0.4 * uniformEnv;
      for (let i = 0; i < out.length; i++) out[i] += uniformAdd;
      // Delayed core flash on star 0 (the sphere's brightest center): starts
      // at +200ms, peak +100ms in, decays over 400ms (500ms total).
      const coreT = elapsed - 200;
      if (coreT >= 0 && coreT < 500) {
        const coreEnv = pulseEnvelope(coreT, 100, 500);
        // Adds another 0.4 → at simultaneous peaks the core hits ~1.8×.
        out[0] += 0.4 * coreEnv;
      }
      return true;
    }
    case "lattice": {
      // Directional sweep top→bottom (row 0 → row 3). 7 cols × 4 rows.
      const cols = 7;
      const rows = 4;
      const rowDelay = 80;
      const rowDur = 280;
      const totalDur = (rows - 1) * rowDelay + rowDur;
      if (elapsed >= totalDur + 80) return false;
      for (let r = 0; r < rows; r++) {
        const rT = elapsed - r * rowDelay;
        if (rT < 0 || rT >= rowDur) continue;
        const env = pulseEnvelope(rT, 80, rowDur);
        const add = 0.6 * env; // peak 1.6×
        for (let c = 0; c < cols; c++) {
          const idx = r * cols + c;
          if (idx < out.length) out[idx] += add;
        }
      }
      return true;
    }
    case "house": {
      // Three sub-cluster cascade. Atelier Amara → Fortunoff → "next acquisition".
      // 120ms offset between cluster starts; 340ms per-cluster envelope.
      const dur = 340;
      const offset = 120;
      const totalDur = 2 * offset + dur; // ~580ms
      if (elapsed >= totalDur + 60) return false;
      const clusters: Array<{ start: number; intensity: number; idxs: number[] }> = [
        { start: 0,            intensity: 0.5, idxs: [0, 1, 2, 3, 4] },         // A — Atelier Amara, 1.5×
        { start: offset,       intensity: 0.5, idxs: [5, 6, 7, 8, 9] },         // B — Fortunoff, 1.5×
        { start: 2 * offset,   intensity: 0.3, idxs: [10, 11, 12] },            // C — third sub-cluster, 1.3×
        // bridges 13, 14 deliberately skipped — scaffold is reserved for arrival
      ];
      for (const cl of clusters) {
        const t = elapsed - cl.start;
        if (t < 0 || t >= dur) continue;
        const env = pulseEnvelope(t, 110, dur);
        const add = cl.intensity * env;
        for (const i of cl.idxs) {
          if (i < out.length) out[i] += add;
        }
      }
      return true;
    }
    default:
      return false;
  }
}

/* ─────────────── Halo billboard texture ─────────────── */

let HALO_TEX: THREE.Texture | null = null;
function getHaloTexture(): THREE.Texture | null {
  if (HALO_TEX) return HALO_TEX;
  if (typeof document === "undefined") return null;
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d");
  if (!ctx) return null;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(245,247,250,1)");
  g.addColorStop(0.35, "rgba(223,230,240,0.6)");
  g.addColorStop(1, "rgba(223,230,240,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  HALO_TEX = tex;
  return tex;
}

/* ─────────────── Per-constellation component ─────────────── */

interface ActivePulse {
  starIdx: number;
  startMs: number;
  params: PulseParams;
}

function ConstellationStarsGroup({
  con,
  baseSize = 1.4,
}: {
  con: Constellation3D;
  baseSize?: number;
}) {
  const config = ARRIVAL_CONFIGS[con.id];
  const meshRefs = useRef<(THREE.Mesh | null)[]>([]);
  const matRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const haloRefs = useRef<(THREE.Sprite | null)[]>([]);
  const haloMatRefs = useRef<(THREE.SpriteMaterial | null)[]>([]);

  const starBaseScales = useMemo(
    () => con.stars.map((_, i) => (con.hero.includes(i) ? baseSize * 1.5 : baseSize)),
    [con, baseSize],
  );

  // Pulse spawn state
  const triggerCaptured = useRef(false);
  const startIsAArr = useRef<boolean[]>([]);
  const lastSpawnedSeq = useRef(-1);
  const pulses = useRef<ActivePulse[]>([]);

  // Per-frame scratch (avoid allocation)
  const scaleAdd = useMemo(() => new Float32Array(con.stars.length), [con]);
  const emissiveAdd = useMemo(() => new Float32Array(con.stars.length), [con]);
  const haloOp = useMemo(() => new Float32Array(con.stars.length), [con]);
  const haloScale = useMemo(() => new Float32Array(con.stars.length), [con]);

  const halo = getHaloTexture();

  useFrame(() => {
    const now = performance.now();
    const triggerMs = sceneState.arrivalTriggers[con.id];

    // Capture line-draw direction latching once at trigger.
    if (triggerMs !== null && !triggerCaptured.current) {
      const cx = sceneState.cameraPos.x;
      const cy = sceneState.cameraPos.y;
      const cz = sceneState.cameraPos.z;
      startIsAArr.current = config.segments.map(([a, b]) => {
        const sa = con.stars[a];
        const sb = con.stars[b];
        const da = (sa[0] - cx) ** 2 + (sa[1] - cy) ** 2 + (sa[2] - cz) ** 2;
        const db = (sb[0] - cx) ** 2 + (sb[1] - cy) ** 2 + (sb[2] - cz) ** 2;
        return da <= db;
      });
      triggerCaptured.current = true;
    }

    // Spawn pulses on segment completions (forward-only; reduced-motion skips).
    if (triggerCaptured.current && triggerMs !== null && !sceneState.reduceMotion) {
      const elapsed = now - triggerMs;
      const stride = config.segmentDurationMs + config.segmentGapMs;
      // seq is "complete" when elapsed >= seq*stride + segmentDurationMs
      const maxCompletedSeq = Math.min(
        config.segments.length - 1,
        Math.floor((elapsed - config.segmentDurationMs) / stride),
      );
      while (lastSpawnedSeq.current < maxCompletedSeq) {
        lastSpawnedSeq.current++;
        const seq = lastSpawnedSeq.current;
        const seg = config.segments[seq];
        const startIsA = startIsAArr.current[seq];
        const destStarIdx = startIsA ? seg[1] : seg[0];
        const completionTime =
          triggerMs + seq * stride + config.segmentDurationMs;
        let params = PARAMS_BY_ID[con.id];
        // House scaffold: strongest pulse on the final 4 segments
        // (the bridges connecting the three sub-clusters).
        if (con.id === "house" && seq >= config.segments.length - 4) {
          params = HOUSE_SCAFFOLD_PARAMS;
        }
        pulses.current.push({
          starIdx: destStarIdx,
          startMs: completionTime,
          params,
        });
      }
    }

    // Constellation-wide foreshadow pulse (preserved from prior implementation).
    let foreshadowPulse = 0;
    const transit = TRANSITS.find((t) => t.segIndex === sceneState.segIndex);
    if (transit && transit.destination === con.id) {
      const t = sceneState.segT;
      if (t > FORESHADOW.startSegT && t < FORESHADOW.endSegT) {
        const up =
          (t - FORESHADOW.startSegT) /
          Math.max(1e-6, FORESHADOW.peakSegT - FORESHADOW.startSegT);
        const dn =
          (FORESHADOW.endSegT - t) /
          Math.max(1e-6, FORESHADOW.endSegT - FORESHADOW.peakSegT);
        const tri = Math.min(1, Math.max(0, Math.min(up, dn)));
        foreshadowPulse = FORESHADOW_EASE(tri);
      }
    }
    const foreshadowMul = 1 + FORESHADOW.boost * foreshadowPulse;

    // Reset per-frame sums.
    const n = con.stars.length;
    scaleAdd.fill(0);
    emissiveAdd.fill(0);
    haloOp.fill(0);
    haloScale.fill(0);

    // Sum / cull active pulses.
    let alive = 0;
    for (let i = pulses.current.length - 1; i >= 0; i--) {
      const ps = pulses.current[i];
      const t = now - ps.startMs;
      if (t >= ps.params.duration) {
        pulses.current.splice(i, 1);
        continue;
      }
      if (t < 0) {
        // not yet active (segment hasn't completed) — but completionTime check
        // above ensures we only push at completion, so this is rare.
        alive++;
        continue;
      }
      alive++;
      const env = pulseEnvelope(t, ps.params.peakAt, ps.params.duration);
      const idx = ps.starIdx;
      scaleAdd[idx] += ps.params.scalePeakAdd * env;
      emissiveAdd[idx] += ps.params.emissivePeakAdd * env;

      // Halo: stack by max so it doesn't blow out additive opacity.
      const haloOpacity = ps.params.haloOpacityPeak * env;
      let hScale: number;
      if (t <= ps.params.peakAt) {
        const f = t / ps.params.peakAt;
        hScale = 0.6 + (ps.params.haloScalePeak - 0.6) * easeOutQuint(f);
      } else {
        const f = (t - ps.params.peakAt) / (ps.params.duration - ps.params.peakAt);
        hScale =
          ps.params.haloScalePeak +
          (ps.params.haloScaleEnd - ps.params.haloScalePeak) * easeInOutCubic(f);
      }
      if (haloOpacity > haloOp[idx]) {
        haloOp[idx] = haloOpacity;
        haloScale[idx] = hScale;
      }
    }

    sceneState.activePulseCount = alive;
    if (alive > sceneState.maxActivePulses) sceneState.maxActivePulses = alive;

    // Apply to meshes.
    for (let i = 0; i < n; i++) {
      const m = meshRefs.current[i];
      const mat = matRefs.current[i];
      if (!m || !mat) continue;
      const sAdd = Math.min(SCALE_CAP_ADD, scaleAdd[i]);
      const eAdd = Math.min(EMISSIVE_CAP_ADD, emissiveAdd[i]);
      const finalScale = starBaseScales[i] * foreshadowMul * (1 + sAdd);
      m.scale.setScalar(finalScale);

      const intensity = foreshadowMul * (1 + eAdd);
      mat.color.setRGB(
        BASE_COLOR.r * intensity,
        BASE_COLOR.g * intensity,
        BASE_COLOR.b * intensity,
      );

      const halo = haloRefs.current[i];
      const haloMat = haloMatRefs.current[i];
      if (halo && haloMat) {
        const op = Math.min(HALO_OPACITY_CAP, haloOp[i]);
        haloMat.opacity = op;
        const visible = op > 0.005;
        halo.visible = visible;
        if (visible) {
          const hs = haloScale[i] * starBaseScales[i] * 4;
          halo.scale.setScalar(hs);
        }
      }
    }
  });

  return (
    <group>
      {con.stars.map((s, i) => (
        <group key={i} position={[s[0], s[1], s[2]]}>
          <mesh
            ref={(el) => {
              meshRefs.current[i] = el;
            }}
            geometry={STAR_GEO}
            scale={starBaseScales[i]}
            frustumCulled={false}
            renderOrder={3}
          >
            <meshBasicMaterial
              ref={(el) => {
                matRefs.current[i] = el;
              }}
              color={BASE_COLOR}
              transparent
              opacity={0.95}
              depthWrite={false}
              blending={THREE.AdditiveBlending}
              toneMapped={false}
            />
          </mesh>
          {halo ? (
            <sprite
              ref={(el) => {
                haloRefs.current[i] = el;
              }}
              visible={false}
              renderOrder={2}
            >
              <spriteMaterial
                ref={(el) => {
                  haloMatRefs.current[i] = el;
                }}
                map={halo}
                color="#f5f7fa"
                transparent
                opacity={0}
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                toneMapped={false}
              />
            </sprite>
          ) : null}
        </group>
      ))}
    </group>
  );
}

export function AllConstellationStars() {
  return (
    <>
      {CONSTELLATIONS.map((c) => (
        <ConstellationStarsGroup key={c.id} con={c} />
      ))}
    </>
  );
}
