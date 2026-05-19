import { Suspense, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, type ThreeEvent } from "@react-three/fiber";
import {
  Billboard,
  Environment,
  OrbitControls,
  Stars,
  useGLTF,
} from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";
import { useNavigate } from "@tanstack/react-router";
import CameraController from "@/galaxy/CameraController";
import { CONSTELLATIONS } from "@/galaxy/constellations";
import { useGalaxyStore } from "@/galaxy/galaxyStore";

// Shared Draco loader.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "wasm" });
const extendLoader = (loader: any) => loader.setDRACOLoader(dracoLoader);

useGLTF.preload("/assets/center.glb");
CONSTELLATIONS.forEach((c) => useGLTF.preload(c.glb));

function GltfNode({
  url,
  position,
  scale = 1,
  hovered = false,
  focused = false,
  selected = false,
  onPointerOver,
  onPointerOut,
  onClick,
}: {
  url: string;
  position: [number, number, number];
  scale?: number;
  hovered?: boolean;
  focused?: boolean;
  selected?: boolean;
  onPointerOver?: (e: ThreeEvent<PointerEvent>) => void;
  onPointerOut?: (e: ThreeEvent<PointerEvent>) => void;
  onClick?: (e: ThreeEvent<MouseEvent>) => void;
}) {
  const { scene } = useGLTF(url, undefined, undefined, extendLoader) as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  const group = useRef<THREE.Group>(null);
  const ringMat = useRef<THREE.MeshBasicMaterial>(null);

  const radius = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const sphere = new THREE.Sphere();
    box.getBoundingSphere(sphere);
    return Math.max(1.5, sphere.radius * 1.25);
  }, [cloned]);

  useFrame((state, delta) => {
    if (group.current) {
      const targetScale =
        scale * (selected ? 1.18 : hovered || focused ? 1.1 : 1);
      const k = 1 - Math.exp(-delta * 8);
      group.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        k,
      );
    }
    if (ringMat.current) {
      const base = focused ? 0.85 : 0;
      const pulse =
        focused ? Math.sin(state.clock.elapsedTime * 3) * 0.15 : 0;
      const target = base + pulse;
      ringMat.current.opacity +=
        (target - ringMat.current.opacity) * (1 - Math.exp(-delta * 10));
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

function Scene() {
  const navigate = useNavigate();
  const focusedId = useGalaxyStore((s) => s.focusedConstellationId);
  const setFocus = useGalaxyStore((s) => s.setFocus);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

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
            url={c.glb}
            position={c.position}
            hovered={hoveredId === c.id}
            focused={hoveredId ? hoveredId === c.id : focusedId === c.id}
            selected={focusedId === c.id}
            onPointerOver={() => setHoveredId(c.id)}
            onPointerOut={() => setHoveredId(null)}
            onClick={() => {
              setFocus(c.id);
              navigate({ to: c.route });
            }}
          />
        ))}
      </Suspense>
      <CameraController />
    </>
  );
}

export default function Galaxy() {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#070b18",
        zIndex: 0,
      }}
    >
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: [0, 6, 38], fov: 55, near: 0.1, far: 4000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070b18"]} />
        <Scene />
        <OrbitControls
          makeDefault
          enablePan={false}
          enableZoom
          enableRotate
          minDistance={3}
          maxDistance={120}
        />
      </Canvas>
    </div>
  );
}
