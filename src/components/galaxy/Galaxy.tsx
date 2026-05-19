import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import { Billboard, Environment, Stars, useGLTF } from "@react-three/drei";

import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";
import { BRAND_STOPS } from "./stops";

// Shared Draco loader for all useGLTF() calls.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "wasm" });
const extendLoader = (loader: any) => loader.setDRACOLoader(dracoLoader);

useGLTF.preload("/assets/center.glb");
useGLTF.preload("/assets/aquarius.glb");
useGLTF.preload("/assets/cygnus.glb");
useGLTF.preload("/assets/orion.glb");
useGLTF.preload("/assets/phoenix.glb");
useGLTF.preload("/assets/ursa_major.glb");

type ConstellationDef = {
  id: string;
  url: string;
  position: [number, number, number];
};

// World-space positions MUST match BRAND_STOPS.target in ./stops.ts.
const CONSTELLATIONS: ConstellationDef[] = [
  { id: "lumex_online", url: "/assets/aquarius.glb", position: [18, 4, -6] },
  { id: "lumex", url: "/assets/cygnus.glb", position: [-14, 7, -12] },
  { id: "nsphere", url: "/assets/orion.glb", position: [6, -9, -22] },
  { id: "atelier_amara", url: "/assets/phoenix.glb", position: [-8, 3, -30] },
  { id: "fortunoff", url: "/assets/ursa_major.glb", position: [22, 12, -26] },
];

function GltfNode({
  url,
  position,
  scale = 1,
  hovered = false,
  selected = false,
  focused = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  hovered?: boolean;
  selected?: boolean;
  focused?: boolean;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const { scene } = useGLTF(url, undefined, undefined, extendLoader) as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<THREE.Group>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);

  // Bounding sphere radius drives the focus ring size.
  const radius = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    return Math.max(1.5, sphere.radius * 1.25);
  }, [cloned]);

  // Subtle scale on hover/selected + ring opacity pulse when focused.
  useFrame((state, delta) => {
    if (group.current) {
      const targetScale = scale * (selected ? 1.18 : hovered || focused ? 1.1 : 1);
      const k = 1 - Math.exp(-delta * 8);
      group.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        k,
      );
    }
    if (ringMat.current) {
      const base = focused ? 0.85 : 0;
      const pulse = focused ? Math.sin(state.clock.elapsedTime * 3) * 0.15 : 0;
      const target = base + pulse;
      ringMat.current.opacity += (target - ringMat.current.opacity) * (1 - Math.exp(-delta * 10));
    }
  });

  return (
    <group
      ref={group}
      position={position}
      onPointerOver={(e) => {
        e.stopPropagation();
        onPointerOver?.(e);
      }}
      onPointerOut={(e) => {
        e.stopPropagation();
        onPointerOut?.(e);
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
    >
      <primitive object={cloned} />
      {/* Focus ring — billboarded so it always faces the camera */}
      <Billboard>
        <mesh renderOrder={999}>
          <ringGeometry args={[radius, radius + 0.12, 96]} />
          <meshBasicMaterial
            ref={ringMat}
            color="#a5c8ff"
            transparent
            opacity={0}
            side={THREE.DoubleSide}
            depthTest={false}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}


/** Smoothly tweens the camera between BRAND_STOPS entries by index. */
function CameraRig({ activeIndex }: { activeIndex: number }) {
  const targetPos = useRef(new THREE.Vector3());
  const targetLook = useRef(new THREE.Vector3());
  const currentLook = useRef(new THREE.Vector3(0, 0, -12));

  useFrame((state, delta) => {
    const stop = BRAND_STOPS[Math.max(0, Math.min(BRAND_STOPS.length - 1, activeIndex))];
    if (!stop) return;

    targetLook.current.set(stop.target[0], stop.target[1], stop.target[2]);
    targetPos.current.set(
      stop.target[0] + stop.offset[0],
      stop.target[1] + stop.offset[1],
      stop.target[2] + stop.offset[2],
    );

    const k = 1 - Math.exp(-delta * 2.4);
    state.camera.position.lerp(targetPos.current, k);
    currentLook.current.lerp(targetLook.current, k);
    state.camera.lookAt(currentLook.current);
  });

  return null;
}

function Scene({
  activeIndex,
  hoveredId,
  selectedId,
  focusedId,
  onHover,
  onSelect,
}: {
  activeIndex: number;
  hoveredId: string | null;
  selectedId: string | null;
  focusedId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
}) {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 20, 10]} intensity={0.8} />
      <Stars radius={300} depth={80} count={4000} factor={4} fade speed={0.4} />
      <Suspense fallback={null}>
        <Environment files="/assets/nebulas_4.hdr" background={false} />
        <GltfNode url="/assets/center.glb" position={[0, 0, 0]} />
        {CONSTELLATIONS.map((c) => (
          <GltfNode
            key={c.id}
            url={c.url}
            position={c.position}
            hovered={hoveredId === c.id}
            selected={selectedId === c.id}
            focused={focusedId === c.id}
            onPointerOver={() => onHover(c.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => onSelect(c.id)}
          />
        ))}
      </Suspense>
      <CameraRig activeIndex={activeIndex} />
    </>
  );
}


export default function Galaxy({
  activeIndex = 0,
  selectedId = null,
  focusedId = null,
  onSelect,
  onHoverChange,
}: {
  activeIndex?: number;
  selectedId?: string | null;
  focusedId?: string | null;
  onSelect?: (id: string) => void;
  onHoverChange?: (id: string | null) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Visual highlight = mouse hover OR keyboard focus.
  const highlightId = hoveredId ?? focusedId;


  const handleHover = (id: string | null) => {
    setHoveredId(id);
    onHoverChange?.(id);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#070b18",
        cursor: hoveredId ? "pointer" : "default",
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: [0, 6, 38], fov: 55, near: 0.1, far: 4000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070b18"]} />
        <Scene
          activeIndex={activeIndex}
          hoveredId={highlightId}
          selectedId={selectedId}
          onHover={handleHover}
          onSelect={(id) => onSelect?.(id)}
        />
      </Canvas>

    </div>
  );
}
