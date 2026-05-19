import { Suspense, useMemo } from "react";
import { Canvas, useLoader } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Stars } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader } from "three/examples/jsm/loaders/DRACOLoader.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

// Configure a shared Draco loader for all useGLTF calls.
const dracoLoader = new DRACOLoader();
dracoLoader.setDecoderPath("/draco/");
dracoLoader.setDecoderConfig({ type: "wasm" });
useGLTF.preload("/assets/center.glb");
useGLTF.preload("/assets/aquarius.glb");
useGLTF.preload("/assets/cygnus.glb");
useGLTF.preload("/assets/orion.glb");
useGLTF.preload("/assets/phoenix.glb");
useGLTF.preload("/assets/ursa_major.glb");

const extendLoader = (loader: GLTFLoader) => loader.setDRACOLoader(dracoLoader);

type ConstellationDef = {
  id: string;
  url: string;
  position: [number, number, number];
  scale?: number;
};

const CONSTELLATIONS: ConstellationDef[] = [
  { id: "aquarius", url: "/assets/aquarius.glb", position: [300, 0, -200], scale: 1 },
  { id: "cygnus", url: "/assets/cygnus.glb", position: [-200, 100, -400], scale: 1 },
  { id: "orion", url: "/assets/orion.glb", position: [100, -150, -700], scale: 1 },
  { id: "phoenix", url: "/assets/phoenix.glb", position: [-100, 50, -1000], scale: 1 },
  { id: "ursa_major", url: "/assets/ursa_major.glb", position: [400, 200, -900], scale: 1 },
];

function GltfNode({ url, position, scale = 1 }: { url: string; position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF(url, undefined, undefined, extendLoader) as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} position={position} scale={scale} />;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <Stars radius={2000} depth={400} count={4000} factor={5} fade speed={0.4} />
      <Suspense fallback={null}>
        <Environment files="/assets/nebulas_4.hdr" background={false} />
        <GltfNode url="/assets/center.glb" position={[0, 0, 0]} scale={1} />
        {CONSTELLATIONS.map((c) => (
          <GltfNode key={c.id} url={c.url} position={c.position} scale={c.scale} />
        ))}
      </Suspense>
    </>
  );
}

export default function Galaxy() {
  return (
    <div className="fixed inset-0 bg-[#070b18]">
      <Canvas
        camera={{ position: [0, 50, 250], fov: 55, near: 0.1, far: 5000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070b18"]} />
        <fog attach="fog" args={["#070b18", 600, 3500]} />
        <Scene />
        <OrbitControls enablePan enableZoom enableRotate makeDefault />
      </Canvas>
    </div>
  );
}
