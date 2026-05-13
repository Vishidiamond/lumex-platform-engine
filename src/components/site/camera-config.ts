import * as THREE from "three";

/**
 * SINGLE TUNABLE CONFIG OBJECT for the cinematic camera path.
 * Edit values here; the rig in Starfield.tsx reads everything from this file.
 */

export type SegmentKind = "opening" | "drift" | "rise" | "arrival" | "transit" | "pullback";

export type Bezier = readonly [number, number, number, number];

/** Cubic-bezier easing presets (CSS cubic-bezier() semantics). */
export const EASING: Record<string, Bezier> = {
  linear:    [0, 0, 1, 1],
  arrival:   [0.25, 1, 0.5, 1],   // strong deceleration — settle into constellation
  transit:   [0.65, 0, 0.35, 1],  // accelerate / decelerate — fast through space
  pullback:  [0.4, 0, 0.2, 1],    // slow / fast / slow — dramatic reveal
  drift:     [0.45, 0, 0.55, 1],  // gentle sinusoidal-feeling drift
  recede:    [0.4, 0, 0.6, 1],    // sub-stage A — gentle reverse, no drama yet
  lift:      [0.3, 0, 0.2, 1],    // sub-stage B — accelerating lift, the dramatic acceleration
  settle:    [0.5, 0, 0.25, 1],   // sub-stage C — slow approach to the final pose
};

export interface Keyframe {
  /** Scroll progress 0..1 at which this pose is hit. */
  progress: number;
  position: readonly [number, number, number];
  /** lookAt target. */
  target: readonly [number, number, number];
  fov: number;
  /** What kind of beat this is. Drives roll / overshoot / parallax behavior. */
  kind: SegmentKind;
  /** Easing applied to the segment that ENDS at this keyframe. */
  easeIn?: Bezier;
}

/** 11 keyframes (Beat 0 → Beat 10). */
export const KEYFRAMES: Keyframe[] = [
  // 0 — Opening field
  { progress: 0.00, position: [0, 0, 0],       target: [0, 0, -100],   fov: 60, kind: "opening" },
  // 1 — Mission (slow forward drift)
  { progress: 0.08, position: [0, 0, -30],     target: [0, 0, -130],   fov: 60, kind: "drift",   easeIn: EASING.drift },
  // 2 — The map (rise, FOV widens — 4 constellations distantly visible)
  { progress: 0.16, position: [0, 40, -80],    target: [0, 0, -300],   fov: 75, kind: "rise",    easeIn: EASING.drift },
  // 3 — Arrival: Rails
  { progress: 0.28, position: [250, 10, -200], target: [300, 0, -200], fov: 50, kind: "arrival", easeIn: EASING.arrival },
  // 4 — Transit to Sphere
  { progress: 0.38, position: [50, 60, -300],  target: [-100, 80, -380], fov: 65, kind: "transit", easeIn: EASING.transit },
  // 5 — Arrival: Sphere
  { progress: 0.46, position: [-160, 100, -400], target: [-200, 100, -400], fov: 45, kind: "arrival", easeIn: EASING.arrival },
  // 6 — Transit to Lattice (notable vertical drop)
  { progress: 0.58, position: [0, -50, -550],  target: [100, -150, -700], fov: 60, kind: "transit", easeIn: EASING.transit },
  // 7 — Arrival: Lattice
  { progress: 0.66, position: [60, -140, -650],target: [100, -150, -700], fov: 50, kind: "arrival", easeIn: EASING.arrival },
  // 8 — Transit to House
  { progress: 0.78, position: [-50, 0, -850],  target: [-100, 50, -1000], fov: 65, kind: "transit", easeIn: EASING.transit },
  // 9 — Arrival: House
  { progress: 0.86, position: [-90, 50, -950], target: [-100, 50, -1000], fov: 55, kind: "arrival", easeIn: EASING.arrival },
  // 10 — Pullback sub-stage A: slow recede from House (other constellations creep into peripheral view)
  { progress: 0.92, position: [-40, 80, -400], target: [-100, 50, -1000], fov: 55, kind: "pullback", easeIn: EASING.recede },
  // 11 — Pullback sub-stage B: the lift — camera lifts and rotates upward, lookAt swings to sky-center
  { progress: 0.97, position: [0, 200, 100],   target: [0, 0, -500],     fov: 75, kind: "pullback", easeIn: EASING.lift },
  // 12 — Pullback sub-stage C: the final pose — full sky, all four constellations and scaffold visible
  { progress: 1.00, position: [0, 100, 200],   target: [0, 0, -500],     fov: 85, kind: "pullback", easeIn: EASING.settle },
];

/** Sub-stage progress ranges for the Beat 10 reveal (used by overlay + scaffold). */
export const BEAT10 = {
  subA: { start: 0.86, end: 0.92 },  // slow recede
  subB: { start: 0.92, end: 0.97 },  // the lift
  subC: { start: 0.97, end: 1.00 },  // the final pose
  /** Simultaneous scaffold draw triggers here, mid-lift. */
  scaffoldTrigger: 0.94,
  scaffoldDurationMs: 1800,
  /** Wall-clock hold once scrollProgress reaches 1.0. */
  holdAfterArrivalMs: 1200,
} as const;

/** Roll (Z-axis rotation) applied during transits, in degrees. Alternates sign. */
export const ROLL = {
  /** Max roll during a transit segment, in degrees. Spec ceiling: 3°. */
  transitDeg: 2,
  /** Roll on arrival/opening/drift segments. Spec: zero. */
  arrivalDeg: 0,
};

/** Slight overshoot of the lookAt target on arrivals — the "settle" feel. */
export const OVERSHOOT = {
  /** 4% overshoot of the segment vector past the target. */
  amount: 0.04,
  /** Where in the segment overshoot peaks (0..1) and where it dies. */
  peakAt: 0.88,
  endAt: 1.0,
};

/** Continuous ambient camera-position drift (independent of scroll). */
export const AMBIENT_DRIFT = {
  ampX: 0.5,        // ±0.5 units
  ampY: 0.3,        // ±0.3 units
  periodSec: 8,     // ~8s sine wave
};

/** Per-tier parallax dampening: 0 = full parallax, 1 = follows camera (static-feeling). */
export const PARALLAX = {
  near: 0,      // peripheral streaming
  mid: 0.5,     // half parallax
  far: 0.92,    // sky dome — barely shifts
  /** Near-tier size multiplier during transits (motion-blur suggestion). */
  nearTransitSizeBoost: 0.15,
};

/**
 * Transit beats — segment indices (i.e. the index `i` such that the segment
 * KEYFRAMES[i] → KEYFRAMES[i+1] is a transit). Destination constellation
 * defines which constellation gets the foreshadowing pulse.
 */
export const TRANSITS: { segIndex: number; destination: "sphere" | "lattice" | "house"; lateralOffsetPct: number; verticalPct: number; line: string }[] = [
  // Segment 3 → 4 (Beat 4 to Sphere) — left, slightly above center
  { segIndex: 3, destination: "sphere",  lateralOffsetPct: -8, verticalPct: 45, line: "Underneath every transaction — a layer of intelligence." },
  // Segment 5 → 6 (Beat 6 to Lattice) — right, slightly below center
  { segIndex: 5, destination: "lattice", lateralOffsetPct:  8, verticalPct: 55, line: "Precision is the product." },
  // Segment 7 → 8 (Beat 8 to House) — centered, high (anticipating House scale)
  { segIndex: 7, destination: "house",   lateralOffsetPct:  0, verticalPct: 38, line: "The category moves up the value chain." },
];

/** Foreshadowing pulse — applied to destination constellation at transit midpoint. */
export const FORESHADOW = {
  /** Luminosity boost (size + opacity multiplier) at peak. */
  boost: 0.4,
  /** Window inside segT where the pulse exists (start, peak, end). */
  startSegT: 0.30,
  peakSegT: 0.55,
  endSegT: 0.78,
  ease: [0.2, 0.8, 0.4, 1] as Bezier,
};

/** Star streak (only during transits). */
export const STREAK = {
  /** Number of near-tier stars sampled for streaking (perf cap). */
  sampleCount: 800,
  /** Streak length is camera-velocity * this scalar. */
  velocityScale: 0.45,
  /** Maximum streak alpha. */
  maxAlpha: 0.55,
};

/** Dense transit stars seeded along the path between Beat 7 → Beat 9. */
export const DENSE_TRANSIT = {
  /** Which transit (segIndex) gets the density boost. */
  segIndex: 7,
  count: 1500,
  /** Cylinder radius around the path. */
  radius: 220,
};


/** Cubic-bezier solver — Newton's method, sufficient for animation curves. */
export function bezier([x1, y1, x2, y2]: Bezier): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;
  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;
  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDx = (t: number) => (3 * ax * t + 2 * bx) * t + cx;
  return (x: number) => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;
    let t = x;
    for (let i = 0; i < 6; i++) {
      const v = sampleX(t) - x;
      const d = sampleDx(t);
      if (Math.abs(d) < 1e-6) break;
      t -= v / d;
    }
    return sampleY(Math.max(0, Math.min(1, t)));
  };
}

/* ─────────── Helpers used by the rig ─────────── */

const _v = new THREE.Vector3();

export function lerpV3(
  out: THREE.Vector3,
  a: readonly [number, number, number],
  b: readonly [number, number, number],
  t: number,
) {
  out.set(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  );
  return out;
}

/** Resolve interpolated camera state at a given scroll progress (0..1). */
export interface ResolvedPose {
  position: THREE.Vector3;
  target: THREE.Vector3;
  fov: number;
  rollDeg: number;
  /** 0..1 — how transit-y this segment is right now (1 at transit peak). */
  transitness: number;
  /** 0..1 — how arrival-y this segment is right now (1 at arrival settle). */
  arrivalness: number;
  /** Index of the segment we're currently inside. */
  segIndex: number;
  /** Local progress within the segment (0..1). */
  segT: number;
}

const _a = new THREE.Vector3();
const _b = new THREE.Vector3();

/** Pre-compile easings once — keeps the per-frame cost down. */
const EASE_FNS = KEYFRAMES.map((k) => bezier(k.easeIn ?? EASING.linear));

export function resolvePose(progress: number, out: ResolvedPose): ResolvedPose {
  const p = Math.max(0, Math.min(1, progress));

  // find segment
  let i = 0;
  for (let k = 0; k < KEYFRAMES.length - 1; k++) {
    if (p >= KEYFRAMES[k].progress && p <= KEYFRAMES[k + 1].progress) {
      i = k;
      break;
    }
    if (p > KEYFRAMES[k + 1].progress) i = k + 1;
  }
  if (i >= KEYFRAMES.length - 1) i = KEYFRAMES.length - 2;

  const a = KEYFRAMES[i];
  const b = KEYFRAMES[i + 1];
  const range = Math.max(1e-6, b.progress - a.progress);
  const tRaw = (p - a.progress) / range;
  const ease = EASE_FNS[i + 1]; // easing applied to this segment uses the END keyframe's easeIn
  const t = ease(Math.max(0, Math.min(1, tRaw)));

  // position + target
  lerpV3(_a, a.position, b.position, t);
  lerpV3(_b, a.target, b.target, t);

  // overshoot on arrivals: push target slightly past, then settle
  if (b.kind === "arrival") {
    const peak = OVERSHOOT.peakAt;
    const end = OVERSHOOT.endAt;
    let amp = 0;
    if (tRaw > 0.7 && tRaw < end) {
      // smooth bump centered at peak
      const up = Math.min(1, Math.max(0, (tRaw - 0.7) / (peak - 0.7)));
      const down = Math.min(1, Math.max(0, (end - tRaw) / (end - peak)));
      amp = up * down * OVERSHOOT.amount;
    }
    if (amp > 0) {
      // overshoot direction = (target - position) normalized * segment length
      _v.subVectors(_b, _a).multiplyScalar(amp);
      _b.add(_v);
    }
  }

  // FOV
  const fov = a.fov + (b.fov - a.fov) * t;

  // Roll: ±transitDeg during transits, alternating sign by segment index for variety
  let rollDeg = 0;
  if (b.kind === "transit") {
    const sign = i % 2 === 0 ? 1 : -1;
    // rises from 0 → peak → 0 across the segment
    rollDeg = sign * ROLL.transitDeg * Math.sin(tRaw * Math.PI);
  }

  // transitness / arrivalness for downstream effects
  const transitness = b.kind === "transit" ? Math.sin(tRaw * Math.PI) : 0;
  const arrivalness =
    b.kind === "arrival" ? Math.min(1, Math.max(0, (tRaw - 0.6) / 0.4)) : 0;

  out.position.copy(_a);
  out.target.copy(_b);
  out.fov = fov;
  out.rollDeg = rollDeg;
  out.transitness = transitness;
  out.arrivalness = arrivalness;
  out.segIndex = i;
  out.segT = tRaw;
  return out;
}

export function makePose(): ResolvedPose {
  return {
    position: new THREE.Vector3(),
    target: new THREE.Vector3(),
    fov: 60,
    rollDeg: 0,
    transitness: 0,
    arrivalness: 0,
    segIndex: 0,
    segT: 0,
  };
}
