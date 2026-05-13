import * as THREE from "three";
import { KEYFRAMES } from "./camera-config";

/**
 * Per-constellation lookAt arrival spring config.
 *
 * Position stays scroll-driven. lookAt hands off to a wall-clock spring at
 * each arrival threshold, overshoots in a deliberate per-constellation
 * direction, settles, and rejoins the scroll-driven path via an offset
 * decay so there is no visible snap on handoff.
 */

export interface ArrivalSpringSpec {
  id: "rails" | "sphere" | "lattice" | "house";
  /** scrollProgress threshold — fires ~1% before the camera position settles. */
  triggerProgress: number;
  /** Hysteresis: re-arm once scrollProgress drops below trigger by this amount. */
  rearmHysteresis: number;
  /** Index in KEYFRAMES whose .target is the arrival lookAt. */
  keyframeIndex: number;
  /** Intentional overshoot vector applied to the spring target. */
  overshoot: readonly [number, number, number];
  /** Spring physics. */
  stiffness: number;
  damping: number;
  mass: number;
  /** Hard cap on spring duration (ms). After this, lookAt returns to scroll-driven. */
  maxDurationMs: number;
}

export const ARRIVAL_SPRINGS: ArrivalSpringSpec[] = [
  {
    id: "rails",
    triggerProgress: 0.27,
    rearmHysteresis: 0.03,
    keyframeIndex: 3,
    overshoot: [12, 0, 0],
    stiffness: 180, damping: 22, mass: 1,
    maxDurationMs: 600,
  },
  {
    id: "sphere",
    triggerProgress: 0.45,
    rearmHysteresis: 0.03,
    keyframeIndex: 5,
    overshoot: [0, 6, 0],
    stiffness: 180, damping: 22, mass: 1,
    maxDurationMs: 600,
  },
  {
    id: "lattice",
    triggerProgress: 0.65,
    rearmHysteresis: 0.03,
    keyframeIndex: 7,
    overshoot: [0, -8, 0],
    stiffness: 180, damping: 22, mass: 1,
    maxDurationMs: 600,
  },
  {
    id: "house",
    triggerProgress: 0.85,
    rearmHysteresis: 0.03,
    keyframeIndex: 9,
    overshoot: [-10, 0, 0],
    stiffness: 180, damping: 22, mass: 1,
    maxDurationMs: 600,
  },
];

export interface SpringRuntime {
  spec: ArrivalSpringSpec;
  /** True if a forward crossing should fire the spring. Resets after rearm hysteresis. */
  armed: boolean;
  /** Wall-clock start time (performance.now()) when spring fired, else null. */
  startedAt: number | null;
  /** Current spring position (lookAt vector). */
  pos: THREE.Vector3;
  /** Current spring velocity. */
  vel: THREE.Vector3;
  /** Spring target = arrival lookAt + overshoot (set on fire). */
  target: THREE.Vector3;
  /** Final lookAt at handoff (when spring exits). */
  finalLookAt: THREE.Vector3;
  /** True while spring owns the lookAt. */
  active: boolean;
  /** Diagnostic: peak |pos - arrivalTarget| reached (overshoot amplitude). */
  peakOvershoot: number;
  /** Diagnostic: ms from fire to first time |pos - arrivalTarget| < settleEps. */
  settleMs: number | null;
}

export function makeSpringRuntime(spec: ArrivalSpringSpec): SpringRuntime {
  return {
    spec,
    armed: true,
    startedAt: null,
    pos: new THREE.Vector3(),
    vel: new THREE.Vector3(),
    target: new THREE.Vector3(),
    finalLookAt: new THREE.Vector3(),
    active: false,
    peakOvershoot: 0,
    settleMs: null,
  };
}

/** Step a spring one frame using semi-implicit Euler. */
export function stepSpring(rt: SpringRuntime, dt: number) {
  const { stiffness: k, damping: c, mass: m } = rt.spec;
  // a = (k/m) * (target - x) - (c/m) * v
  const ax = (k / m) * (rt.target.x - rt.pos.x) - (c / m) * rt.vel.x;
  const ay = (k / m) * (rt.target.y - rt.pos.y) - (c / m) * rt.vel.y;
  const az = (k / m) * (rt.target.z - rt.pos.z) - (c / m) * rt.vel.z;
  rt.vel.x += ax * dt;
  rt.vel.y += ay * dt;
  rt.vel.z += az * dt;
  rt.pos.x += rt.vel.x * dt;
  rt.pos.y += rt.vel.y * dt;
  rt.pos.z += rt.vel.z * dt;
}

/** Resolve the arrival lookAt (without overshoot) for a spring spec. */
export function arrivalLookAt(spec: ArrivalSpringSpec, out: THREE.Vector3): THREE.Vector3 {
  const k = KEYFRAMES[spec.keyframeIndex];
  out.set(k.target[0], k.target[1], k.target[2]);
  return out;
}
