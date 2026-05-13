import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { CONSTELLATIONS } from "./constellations3d";
import {
  AMBIENT_DRIFT,
  KEYFRAMES,
  PARALLAX,
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
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  return g;
}

interface TierHandle {
  group: THREE.Group | null;
  material: THREE.PointsMaterial | null;
  baseSize: number;
  damp: number;
}

function StarTier({ spec, handleRef }: { spec: TierSpec; handleRef: React.MutableRefObject<TierHandle> }) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.PointsMaterial>(null);
  const geom = useMemo(() => makeTierGeometry(spec.count, spec.rMin, spec.rMax), [spec.count, spec.rMin, spec.rMax]);

  useEffect(() => {
    handleRef.current = {
      group: groupRef.current,
      material: matRef.current,
      baseSize: spec.size,
      damp: spec.parallaxDamp,
    };
  }, [handleRef, spec.size, spec.parallaxDamp]);

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

/* ─────────────── Constellation bright stars ─────────────── */

function ConstellationStars() {
  const geom = useMemo(() => {
    const all: number[] = [];
    const cols: number[] = [];
    const c = new THREE.Color("#eaf1ff");
    CONSTELLATIONS.forEach((con) => {
      con.stars.forEach((s) => {
        all.push(s[0], s[1], s[2]);
        cols.push(c.r, c.g, c.b);
      });
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(all), 3));
    g.setAttribute("color", new THREE.BufferAttribute(new Float32Array(cols), 3));
    return g;
  }, []);

  return (
    <points frustumCulled={false}>
      <primitive object={geom} attach="geometry" />
      <pointsMaterial
        size={4}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.95}
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
  tiers: { near: React.MutableRefObject<TierHandle>; mid: React.MutableRefObject<TierHandle>; far: React.MutableRefObject<TierHandle> };
}) {
  const { camera, clock } = useThree();
  const pose = useRef(makePose());
  const tmpLook = useRef(new THREE.Vector3());
  const tmpPos = useRef(new THREE.Vector3());
  const driftedPos = useRef(new THREE.Vector3());

  const persp = camera as THREE.PerspectiveCamera;

  useFrame(() => {
    const p = scrollStore.get();
    const r = resolvePose(p, pose.current);

    // ambient drift (skip under reduced motion)
    let dx = 0;
    let dy = 0;
    if (!reduceMotion) {
      const t = clock.getElapsedTime();
      const w = (Math.PI * 2) / AMBIENT_DRIFT.periodSec;
      dx = Math.sin(t * w) * AMBIENT_DRIFT.ampX;
      dy = Math.cos(t * w * 0.85) * AMBIENT_DRIFT.ampY;
    }

    driftedPos.current.set(r.position.x + dx, r.position.y + dy, r.position.z);
    tmpLook.current.copy(r.target);

    // Hold camera position (no easing toward target — pose is already eased)
    persp.position.copy(driftedPos.current);

    // Smooth re-targeting: lookAt every frame, target itself is interpolated
    persp.up.set(0, 1, 0);
    persp.lookAt(tmpLook.current);

    // Apply roll on Z after lookAt
    if (Math.abs(r.rollDeg) > 1e-4 && !reduceMotion) {
      persp.rotateZ((r.rollDeg * Math.PI) / 180);
    }

    // FOV
    if (Math.abs(persp.fov - r.fov) > 1e-3) {
      persp.fov = r.fov;
      persp.updateProjectionMatrix();
    }

    // Parallax-dampened star tiers — far tier follows camera (sky dome feel)
    for (const ref of [tiers.near, tiers.mid, tiers.far]) {
      const h = ref.current;
      if (!h.group) continue;
      tmpPos.current.copy(driftedPos.current).multiplyScalar(h.damp);
      h.group.position.copy(tmpPos.current);
    }

    // Near-tier size boost during transits — motion-blur suggestion
    const nearMat = tiers.near.current.material;
    const nearBase = tiers.near.current.baseSize;
    if (nearMat) {
      const target = nearBase * (1 + PARALLAX.nearTransitSizeBoost * r.transitness);
      // small lerp so size changes feel organic
      nearMat.size += (target - nearMat.size) * 0.18;
    }
  });

  // Set initial camera state once
  useEffect(() => {
    const r = resolvePose(0, pose.current);
    persp.position.copy(r.position);
    persp.lookAt(r.target);
    persp.fov = r.fov;
    persp.updateProjectionMatrix();
  }, [persp]);

  return null;
}

/* ─────────────── Sky scaffolding (visible only at full pullback, Beat 10) ─────────────── */

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
    // fade in only on the final pullback segment (between Beat 9 → Beat 10)
    const start = KEYFRAMES[KEYFRAMES.length - 2].progress;
    const end = KEYFRAMES[KEYFRAMES.length - 1].progress;
    const local = Math.min(1, Math.max(0, (p - start) / Math.max(1e-6, end - start)));
    const o = local * local * 0.45; // ease-in, max 0.45 alpha
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
      <ConstellationStars />
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
