import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { sceneState } from "@/lib/scene-state";
import { CONSTELLATIONS, CONSTELLATION_BY_ID, type Constellation3D } from "./constellations3d";
import { AllConstellationLines } from "./ConstellationLines";
import { ScaffoldLines } from "./ScaffoldLines";
import {
  ARRIVAL_SPRINGS,
  arrivalLookAt,
  makeSpringRuntime,
  stepSpring,
} from "./arrival-springs";
import {
  AMBIENT_DRIFT,
  BEAT10,
  DENSE_TRANSIT,
  FORESHADOW,
  KEYFRAMES,
  PARALLAX,
  STREAK,
  TRANSITS,
  bezier,
  makePose,
  resolvePose,
} from "./camera-config";
import {
  AMBIENT_DRIFT,
  DENSE_TRANSIT,
  FORESHADOW,
  KEYFRAMES,
  PARALLAX,
  STREAK,
  TRANSITS,
  bezier,
  makePose,
  resolvePose,
} from "./camera-config";

/* ─────────────── Star tier generation ─────────────── */

const STAR_PALETTE = [
  new THREE.Color("#f5f7fa"),
  new THREE.Color("#dfe6f0"),
  new THREE.Color("#c8d4e8"),
];

interface TierSpec {
  count: number;
  rMin: number;
  rMax: number;
  size: number;
  opacity: number;
  parallaxDamp: number;
}

function makeTierGeometry(count: number, rMin: number, rMax: number) {
  const positions = new Float32Array(count * 3);
  const colors = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rMin + Math.random() * (rMax - rMin);
    const u = Math.random();
    const v2 = Math.random();
    const theta = Math.acos(2 * u - 1);
    const phi = 2 * Math.PI * v2;
    const sinT = Math.sin(theta);
    positions[i * 3] = r * sinT * Math.cos(phi);
    positions[i * 3 + 1] = r * sinT * Math.sin(phi);
    positions[i * 3 + 2] = r * Math.cos(theta);
    const c = STAR_PALETTE[i % STAR_PALETTE.length];
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  return { positions, colors };
}

interface TierHandle {
  group: THREE.Group | null;
  material: THREE.PointsMaterial | null;
  baseSize: number;
  damp: number;
  positions?: Float32Array;
}

function StarTier({
  spec,
  handleRef,
}: {
  spec: TierSpec;
  handleRef: React.MutableRefObject<TierHandle>;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const data = useMemo(
    () => makeTierGeometry(spec.count, spec.rMin, spec.rMax),
    [spec.count, spec.rMin, spec.rMax],
  );
  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(data.positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(data.colors, 3));
    return g;
  }, [data]);

  useEffect(() => {
    handleRef.current = {
      group: groupRef.current,
      material: matRef.current,
      baseSize: spec.size,
      damp: spec.parallaxDamp,
      positions: data.positions,
    };
  }, [handleRef, spec.size, spec.parallaxDamp, data.positions]);

  return (
    <group ref={groupRef}>
      <points frustumCulled={false}>
        <primitive object={geom} attach="geometry" />
        <pointsMaterial
          ref={matRef}
          size={spec.size}
          sizeAttenuation
          vertexColors
          transparent
          opacity={spec.opacity}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}

/* ─────────────── Per-constellation bright stars (pulsed independently) ─────────────── */

const FORESHADOW_EASE = bezier(FORESHADOW.ease);

function ConstellationPoints({
  con,
  baseSize = 4,
  baseOpacity = 0.85,
}: {
  con: Constellation3D;
  baseSize?: number;
  baseOpacity?: number;
}) {
  const matRef = useRef<THREE.PointsMaterial>(null);
  const geom = useMemo(() => {
    const positions = new Float32Array(con.stars.length * 3);
    const colors = new Float32Array(con.stars.length * 3);
    const c = new THREE.Color("#eaf1ff");
    con.stars.forEach((s, i) => {
      positions[i * 3] = s[0];
      positions[i * 3 + 1] = s[1];
      positions[i * 3 + 2] = s[2];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [con]);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    // Is this constellation the destination of the currently-playing transit?
    let pulse = 0;
    const transit = TRANSITS.find((t) => t.segIndex === sceneState.segIndex);
    if (transit && transit.destination === con.id) {
      const t = sceneState.segT;
      if (t > FORESHADOW.startSegT && t < FORESHADOW.endSegT) {
        // Triangle wave with bezier ease — peak at peakSegT.
        const up =
          (t - FORESHADOW.startSegT) /
          Math.max(1e-6, FORESHADOW.peakSegT - FORESHADOW.startSegT);
        const dn =
          (FORESHADOW.endSegT - t) /
          Math.max(1e-6, FORESHADOW.endSegT - FORESHADOW.peakSegT);
        const tri = Math.min(1, Math.max(0, Math.min(up, dn)));
        pulse = FORESHADOW_EASE(tri);
      }
    }
    const targetSize = baseSize * (1 + FORESHADOW.boost * pulse);
    const targetOpacity = Math.min(1, baseOpacity * (1 + FORESHADOW.boost * pulse));
    mat.size += (targetSize - mat.size) * 0.25;
    mat.opacity += (targetOpacity - mat.opacity) * 0.25;
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geom} attach="geometry" />
      <pointsMaterial
        ref={matRef}
        size={baseSize}
        sizeAttenuation
        vertexColors
        transparent
        opacity={baseOpacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

function AllConstellations() {
  return (
    <>
      {CONSTELLATIONS.map((c) => (
        <ConstellationPoints key={c.id} con={c} />
      ))}
    </>
  );
}

/* ─────────────── Near-tier streaks (transit-only) ─────────────── */

function NearTierStreaks({ nearRef }: { nearRef: React.MutableRefObject<TierHandle> }) {
  const lineRef = useRef<THREE.LineSegments>(null);
  const matRef = useRef<THREE.LineBasicMaterial>(null);

  // Sample indices into the near tier; static for the lifetime of the scene.
  const indices = useMemo(() => {
    const handle = nearRef.current;
    const total = handle.positions ? handle.positions.length / 3 : 2000;
    const n = Math.min(STREAK.sampleCount, total);
    const arr = new Uint32Array(n);
    for (let i = 0; i < n; i++) arr[i] = Math.floor((i / n) * total);
    return arr;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-allocated dual-vertex buffer (start = star pos, end = star pos − cameraVel).
  const positions = useMemo(() => new Float32Array(indices.length * 6), [indices]);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return g;
  }, [positions]);

  useFrame(() => {
    const handle = nearRef.current;
    const mat = matRef.current;
    if (!mat || !handle.positions || !handle.group) return;

    const alphaTarget = STREAK.maxAlpha * sceneState.transitness;
    mat.opacity += (alphaTarget - mat.opacity) * 0.2;
    mat.visible = mat.opacity > 0.005;

    if (!mat.visible) return;

    // World-space streak vector: opposite of camera velocity.
    const vx = -sceneState.cameraVel.x * STREAK.velocityScale;
    const vy = -sceneState.cameraVel.y * STREAK.velocityScale;
    const vz = -sceneState.cameraVel.z * STREAK.velocityScale;
    const ox = handle.group.position.x;
    const oy = handle.group.position.y;
    const oz = handle.group.position.z;

    const src = handle.positions;
    for (let i = 0; i < indices.length; i++) {
      const idx = indices[i] * 3;
      const wx = src[idx] + ox;
      const wy = src[idx + 1] + oy;
      const wz = src[idx + 2] + oz;
      const out = i * 6;
      positions[out] = wx;
      positions[out + 1] = wy;
      positions[out + 2] = wz;
      positions[out + 3] = wx + vx;
      positions[out + 4] = wy + vy;
      positions[out + 5] = wz + vz;
    }
    geom.attributes.position.needsUpdate = true;
  });

  return (
    <lineSegments ref={lineRef}>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        ref={matRef}
        color="#dfe9ff"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ─────────────── Dense transit stars (Beat 8 → House) ─────────────── */

function DenseTransitStars() {
  const matRef = useRef<THREE.PointsMaterial>(null);

  const geom = useMemo(() => {
    // Seed along the path between Beat 7 (segIndex 7 start) and Beat 9 (segIndex 7 end).
    const a = new THREE.Vector3(...KEYFRAMES[DENSE_TRANSIT.segIndex].position);
    const b = new THREE.Vector3(...KEYFRAMES[DENSE_TRANSIT.segIndex + 1].position);
    const dir = new THREE.Vector3().subVectors(b, a).normalize();
    // Build an orthonormal basis perpendicular to the path.
    const up = new THREE.Vector3(0, 1, 0);
    const right = new THREE.Vector3().crossVectors(dir, up).normalize();
    const upN = new THREE.Vector3().crossVectors(right, dir).normalize();
    const positions = new Float32Array(DENSE_TRANSIT.count * 3);
    const colors = new Float32Array(DENSE_TRANSIT.count * 3);
    const palette = STAR_PALETTE;
    for (let i = 0; i < DENSE_TRANSIT.count; i++) {
      const tt = Math.random();
      const r = Math.sqrt(Math.random()) * DENSE_TRANSIT.radius;
      const ang = Math.random() * Math.PI * 2;
      const px = a.x + (b.x - a.x) * tt + right.x * Math.cos(ang) * r + upN.x * Math.sin(ang) * r;
      const py = a.y + (b.y - a.y) * tt + right.y * Math.cos(ang) * r + upN.y * Math.sin(ang) * r;
      const pz = a.z + (b.z - a.z) * tt + right.z * Math.cos(ang) * r + upN.z * Math.sin(ang) * r;
      positions[i * 3] = px;
      positions[i * 3 + 1] = py;
      positions[i * 3 + 2] = pz;
      const c = palette[i % palette.length];
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, []);

  useFrame(() => {
    const mat = matRef.current;
    if (!mat) return;
    let target = 0;
    if (sceneState.segIndex === DENSE_TRANSIT.segIndex) {
      // Fade in as we enter, sustain through middle, fade as House resolves
      const t = sceneState.segT;
      const fadeIn = Math.min(1, t / 0.15);
      const fadeOut = Math.min(1, (1 - t) / 0.18);
      target = 0.95 * Math.min(fadeIn, fadeOut);
    }
    mat.opacity += (target - mat.opacity) * 0.18;
    mat.visible = mat.opacity > 0.005;
  });

  return (
    <points frustumCulled={false}>
      <primitive object={geom} attach="geometry" />
      <pointsMaterial
        ref={matRef}
        size={1.7}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────── Cinematic Camera Rig ─────────────── */

function CameraRig({
  reduceMotion,
  tiers,
}: {
  reduceMotion: boolean;
  tiers: {
    near: React.MutableRefObject<TierHandle>;
    mid: React.MutableRefObject<TierHandle>;
    far: React.MutableRefObject<TierHandle>;
  };
}) {
  const { camera, clock } = useThree();
  const pose = useRef(makePose());
  const tmpLook = useRef(new THREE.Vector3());
  const tmpPos = useRef(new THREE.Vector3());
  const driftedPos = useRef(new THREE.Vector3());
  const prevCamPos = useRef(new THREE.Vector3());
  const prevTime = useRef(0);

  // ── lookAt spring state machine ──
  const springs = useRef(ARRIVAL_SPRINGS.map(makeSpringRuntime));
  const prevProgress = useRef(0);
  // Persistent post-spring offset that decays into scroll-driven lookAt so
  // the handoff back to scroll-driven motion never snaps.
  const handoffOffset = useRef(new THREE.Vector3());
  const arrivalTmp = useRef(new THREE.Vector3());

  const persp = camera as THREE.PerspectiveCamera;

  useFrame(() => {
    const now = clock.getElapsedTime();
    const dt = Math.max(1 / 240, now - prevTime.current);
    prevTime.current = now;

    const p = scrollStore.get();
    const pPrev = prevProgress.current;
    prevProgress.current = p;
    const r = resolvePose(p, pose.current);

    let dx = 0;
    let dy = 0;
    if (!reduceMotion) {
      const w = (Math.PI * 2) / AMBIENT_DRIFT.periodSec;
      dx = Math.sin(now * w) * AMBIENT_DRIFT.ampX;
      dy = Math.cos(now * w * 0.85) * AMBIENT_DRIFT.ampY;
    }

    driftedPos.current.set(r.position.x + dx, r.position.y + dy, r.position.z);

    // Scroll-driven lookAt baseline (from keyframe interpolation).
    tmpLook.current.copy(r.target);

    // Decay the handoff offset toward zero so scroll-driven lookAt resumes
    // smoothly from wherever the spring left off.
    if (handoffOffset.current.lengthSq() > 1e-6) {
      const decay = Math.min(1, dt * 2.4); // ~420ms tail
      handoffOffset.current.multiplyScalar(1 - decay);
    }

    // ── Per-arrival spring evaluation ──
    for (const rt of springs.current) {
      const spec = rt.spec;

      // Re-arm when scrollProgress drops below trigger by hysteresis.
      if (!rt.armed && p < spec.triggerProgress - spec.rearmHysteresis) {
        rt.armed = true;
      }

      // Fire on forward crossing only.
      const crossedForward =
        rt.armed && pPrev < spec.triggerProgress && p >= spec.triggerProgress;

      if (crossedForward && !reduceMotion) {
        // Capture current lookAt (including any active offset) as spring start.
        rt.pos.copy(tmpLook.current).add(handoffOffset.current);
        rt.vel.set(0, 0, 0);
        // Target = arrival lookAt + intentional overshoot.
        arrivalLookAt(spec, arrivalTmp.current);
        rt.target.set(
          arrivalTmp.current.x + spec.overshoot[0],
          arrivalTmp.current.y + spec.overshoot[1],
          arrivalTmp.current.z + spec.overshoot[2],
        );
        rt.startedAt = performance.now();
        rt.active = true;
        rt.armed = false;
        rt.peakOvershoot = 0;
        rt.settleMs = null;
      }

      if (rt.active) {
        const elapsed = performance.now() - (rt.startedAt ?? 0);
        // Step the spring with sub-stepped fixed dt for stability.
        const steps = Math.max(1, Math.ceil(dt / (1 / 120)));
        const sub = dt / steps;
        for (let s = 0; s < steps; s++) stepSpring(rt, sub);

        // Diagnostics: track overshoot amplitude vs. arrival target (no overshoot offset).
        arrivalLookAt(spec, arrivalTmp.current);
        const dxA = rt.pos.x - arrivalTmp.current.x;
        const dyA = rt.pos.y - arrivalTmp.current.y;
        const dzA = rt.pos.z - arrivalTmp.current.z;
        const dist = Math.sqrt(dxA * dxA + dyA * dyA + dzA * dzA);
        if (dist > rt.peakOvershoot) rt.peakOvershoot = dist;
        if (rt.settleMs === null && dist < 0.5 && elapsed > 60) {
          rt.settleMs = elapsed;
        }

        if (elapsed >= spec.maxDurationMs) {
          // Handoff: capture (spring lookAt − scroll-driven lookAt) so the
          // remaining residual decays from the spring's resting frame back
          // onto the keyframe path.
          rt.finalLookAt.copy(rt.pos);
          handoffOffset.current.copy(rt.pos).sub(r.target);
          rt.active = false;
        } else {
          // Spring owns the lookAt this frame.
          tmpLook.current.copy(rt.pos);
        }
      }
    }

    // Apply residual handoff offset to the (possibly already spring-driven) lookAt.
    if (!springs.current.some((rt) => rt.active)) {
      tmpLook.current.add(handoffOffset.current);
    }

    if (reduceMotion) {
      // Snap to whichever arrival target the user is closest to within window.
      // (Skip the spring entirely.)
      tmpLook.current.copy(r.target);
    }

    persp.position.copy(driftedPos.current);
    persp.up.set(0, 1, 0);
    persp.lookAt(tmpLook.current);

    if (Math.abs(r.rollDeg) > 1e-4 && !reduceMotion) {
      persp.rotateZ((r.rollDeg * Math.PI) / 180);
    }

    if (Math.abs(persp.fov - r.fov) > 1e-3) {
      persp.fov = r.fov;
      persp.updateProjectionMatrix();
    }

    // Parallax-dampened tiers
    for (const ref of [tiers.near, tiers.mid, tiers.far]) {
      const h = ref.current;
      if (!h.group) continue;
      tmpPos.current.copy(driftedPos.current).multiplyScalar(h.damp);
      h.group.position.copy(tmpPos.current);
    }

    const nearMat = tiers.near.current.material;
    const nearBase = tiers.near.current.baseSize;
    if (nearMat) {
      const target = nearBase * (1 + PARALLAX.nearTransitSizeBoost * r.transitness);
      nearMat.size += (target - nearMat.size) * 0.18;
    }

    // Camera velocity (units / sec)
    sceneState.cameraVel
      .copy(driftedPos.current)
      .sub(prevCamPos.current)
      .divideScalar(dt);
    prevCamPos.current.copy(driftedPos.current);
    sceneState.cameraPos.copy(driftedPos.current);
    sceneState.speed += (sceneState.cameraVel.length() - sceneState.speed) * 0.2;
    sceneState.transitness = r.transitness;
    sceneState.arrivalness = r.arrivalness;
    sceneState.segIndex = r.segIndex;
    sceneState.segT = r.segT;
    sceneState.reduceMotion = reduceMotion;
  });

  useEffect(() => {
    const r = resolvePose(0, pose.current);
    persp.position.copy(r.position);
    persp.lookAt(r.target);
    persp.fov = r.fov;
    persp.updateProjectionMatrix();
    prevCamPos.current.copy(persp.position);
  }, [persp]);

  return null;
}

/* ─────────────── Sky scaffolding (visible only at full pullback) ─────────────── */

function FullSkyScaffolding() {
  const ref = useRef<THREE.LineSegments>(null);

  const geom = useMemo(() => {
    const pts: number[] = [];
    const centers = CONSTELLATIONS.map((c) => c.center);
    const pairs: [number, number][] = [
      [0, 1], [1, 2], [2, 3], [3, 0], [0, 2], [1, 3],
    ];
    pairs.forEach(([a, b]) => {
      pts.push(...centers[a], ...centers[b]);
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pts), 3));
    return g;
  }, []);

  useFrame(() => {
    const p = scrollStore.get();
    const start = KEYFRAMES[KEYFRAMES.length - 2].progress;
    const end = KEYFRAMES[KEYFRAMES.length - 1].progress;
    const local = Math.min(1, Math.max(0, (p - start) / Math.max(1e-6, end - start)));
    const o = local * local * 0.45;
    const mat = ref.current?.material as THREE.LineBasicMaterial | undefined;
    if (mat && Math.abs(mat.opacity - o) > 1e-3) {
      mat.opacity = o;
      mat.visible = o > 0.001;
    }
  });

  return (
    <lineSegments ref={ref}>
      <primitive object={geom} attach="geometry" />
      <lineBasicMaterial
        color="#a9bbe0"
        transparent
        opacity={0}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </lineSegments>
  );
}

/* ─────────────── Scene root ─────────────── */

function Scene({ reduceMotion }: { reduceMotion: boolean }) {
  const nearRef = useRef<TierHandle>({ group: null, material: null, baseSize: 1.6, damp: PARALLAX.near });
  const midRef = useRef<TierHandle>({ group: null, material: null, baseSize: 1.0, damp: PARALLAX.mid });
  const farRef = useRef<TierHandle>({ group: null, material: null, baseSize: 0.6, damp: PARALLAX.far });

  return (
    <>
      <StarTier
        handleRef={farRef}
        spec={{ count: 5000, rMin: 700, rMax: 1000, size: 0.6, opacity: 0.45, parallaxDamp: PARALLAX.far }}
      />
      <StarTier
        handleRef={midRef}
        spec={{ count: 4000, rMin: 300, rMax: 700, size: 1.0, opacity: 0.7, parallaxDamp: PARALLAX.mid }}
      />
      <StarTier
        handleRef={nearRef}
        spec={{ count: 2000, rMin: 100, rMax: 300, size: 1.6, opacity: 0.95, parallaxDamp: PARALLAX.near }}
      />
      <NearTierStreaks nearRef={nearRef} />
      <DenseTransitStars />
      <AllConstellations />
      <AllConstellationLines reduceMotion={reduceMotion} />
      <FullSkyScaffolding />
      <CameraRig reduceMotion={reduceMotion} tiers={{ near: nearRef, mid: midRef, far: farRef }} />
    </>
  );
}

/* ─────────────── Public component (SSR-safe) ─────────────── */

export function Starfield() {
  const [mounted, setMounted] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const listener = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          "radial-gradient(ellipse at center, #0d1530 0%, #070b18 55%, #04060f 100%)",
      }}
    >
      {mounted ? (
        <Canvas
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          camera={{ fov: 60, near: 0.1, far: 2000, position: [0, 0, 0] }}
          frameloop="always"
        >
          <Scene reduceMotion={reduceMotion} />
        </Canvas>
      ) : null}
    </div>
  );
}

// Keep export for downstream use
export { CONSTELLATION_BY_ID };
