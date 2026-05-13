import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { scrollStore } from "@/lib/scroll-store";
import { CONSTELLATIONS, v } from "./constellations3d";

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
}

function makeTierGeometry({ count, rMin, rMax }: TierSpec) {
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

function StarTier({ spec }: { spec: TierSpec }) {
  const geom = useMemo(() => makeTierGeometry(spec), [spec]);
  return (
    <points frustumCulled={false}>
      <primitive object={geom} attach="geometry" />
      <pointsMaterial
        size={spec.size}
        sizeAttenuation
        vertexColors
        transparent
        opacity={spec.opacity}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

/* ─────────────── Constellation bright stars ─────────────── */

function ConstellationStars() {
  const { positions, colors } = useMemo(() => {
    const all: number[] = [];
    const cols: number[] = [];
    const c = new THREE.Color("#eaf1ff");
    CONSTELLATIONS.forEach((con) => {
      con.stars.forEach((s) => {
        all.push(s[0], s[1], s[2]);
        cols.push(c.r, c.g, c.b);
      });
    });
    return {
      positions: new Float32Array(all),
      colors: new Float32Array(cols),
    };
  }, []);

  const geom = useMemo(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("color", new THREE.BufferAttribute(colors, 3));
    return g;
  }, [positions, colors]);

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

/* ─────────────── Camera rig (placeholder path; refined in Prompt C) ─────────────── */

function CameraRig({ reduceMotion }: { reduceMotion: boolean }) {
  const { camera } = useThree();
  const target = useRef(new THREE.Vector3());
  const tmp = useRef(new THREE.Vector3());

  // Keyframed camera path: 5 stops — opening, then each constellation arrival.
  const stops = useMemo(() => {
    const opening = {
      pos: new THREE.Vector3(0, 0, 300),
      look: new THREE.Vector3(0, 0, 0),
    };
    return [
      opening,
      ...CONSTELLATIONS.map((c) => ({
        pos: v(c.center).add(new THREE.Vector3(0, 0, 180)),
        look: v(c.center),
      })),
    ];
  }, []);

  useFrame(() => {
    const p = scrollStore.get();
    const seg = (stops.length - 1) * p;
    const i = Math.min(stops.length - 2, Math.floor(seg));
    const t = seg - i;
    // smoothstep for nicer interpolation between stops (Prompt C will replace)
    const ts = t * t * (3 - 2 * t);
    const a = stops[i];
    const b = stops[i + 1];
    target.current.lerpVectors(a.pos, b.pos, ts);
    tmp.current.lerpVectors(a.look, b.look, ts);
    if (reduceMotion) {
      camera.position.copy(target.current);
    } else {
      camera.position.lerp(target.current, 0.12);
    }
    camera.lookAt(tmp.current);
  });

  return null;
}

/* ─────────────── Drifting starfield group ─────────────── */

function Starfield3D({ reduceMotion }: { reduceMotion: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame(() => {
    if (reduceMotion) return;
    const g = groupRef.current;
    if (!g) return;
    g.rotation.y += 0.0002;
  });

  return (
    <group ref={groupRef}>
      <StarTier spec={{ count: 2000, rMin: 100, rMax: 300, size: 1.6, opacity: 0.95 }} />
      <StarTier spec={{ count: 4000, rMin: 300, rMax: 700, size: 1.0, opacity: 0.7 }} />
      <StarTier spec={{ count: 5000, rMin: 700, rMax: 1000, size: 0.6, opacity: 0.45 }} />
      <ConstellationStars />
    </group>
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
          camera={{ fov: 60, near: 0.1, far: 2000, position: [0, 0, 300] }}
          frameloop="always"
        >
          <Starfield3D reduceMotion={reduceMotion} />
          <CameraRig reduceMotion={reduceMotion} />
        </Canvas>
      ) : null}
    </div>
  );
}
