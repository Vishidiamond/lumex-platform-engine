import { Suspense, useMemo, useEffect, useRef } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF, Stars } from "@react-three/drei";
import * as THREE from "three";
import { DRACOLoader } from "three-stdlib";

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

const extendLoader = (loader: any) => loader.setDRACOLoader(dracoLoader);

type ConstellationDef = {
  id: string;
  url: string;
  position: [number, number, number];
  scale?: number;
};

// GLB constellations are authored at unit scale (~10 units across each).
// Lay them out on a small spherical-ish cloud around the origin.
const CONSTELLATIONS: ConstellationDef[] = [
  { id: "aquarius", url: "/assets/aquarius.glb", position: [18, 4, -6], scale: 1 },
  { id: "cygnus", url: "/assets/cygnus.glb", position: [-14, 7, -12], scale: 1 },
  { id: "orion", url: "/assets/orion.glb", position: [6, -9, -22], scale: 1 },
  { id: "phoenix", url: "/assets/phoenix.glb", position: [-8, 3, -30], scale: 1 },
  { id: "ursa_major", url: "/assets/ursa_major.glb", position: [22, 12, -26], scale: 1 },
];

function GltfNode({ url, position, scale = 1 }: { url: string; position: [number, number, number]; scale?: number }) {
  const { scene } = useGLTF(url, undefined, undefined, extendLoader) as any;
  const cloned = useMemo(() => scene.clone(true), [scene]);
  return <primitive object={cloned} position={position} scale={scale} />;
}

/** Walks the wrapped group after geometry resolves and positions the camera
 *  so the whole bounding box fills the viewport with a small margin. */
function AutoFit({ children, margin = 1.25 }: { children: React.ReactNode; margin?: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera, controls, size } = useThree();
  const fitted = useRef(false);

  useEffect(() => {
    let raf = 0;
    let tries = 0;
    const attempt = () => {
      tries += 1;
      const group = groupRef.current;
      if (!group || fitted.current) return;
      const box = new THREE.Box3().setFromObject(group);
      const bsize = new THREE.Vector3();
      const center = new THREE.Vector3();
      box.getSize(bsize);
      box.getCenter(center);
      if (bsize.length() > 1) {
        const persp = camera as THREE.PerspectiveCamera;
        const aspect = size.width / Math.max(1, size.height);
        const fov = (persp.fov * Math.PI) / 180;
        const fitHeightDist = (bsize.y / 2) / Math.tan(fov / 2);
        const fitWidthDist = (bsize.x / 2) / Math.tan(fov / 2) / aspect;
        const dist = Math.max(fitHeightDist, fitWidthDist, bsize.z) * margin;

        // Look from +Z toward the center.
        persp.position.set(center.x, center.y, center.z + dist);
        persp.near = Math.max(0.1, dist / 1000);
        persp.far = dist * 10;
        persp.lookAt(center);
        persp.updateProjectionMatrix();

        const c = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
        if (c?.target) {
          c.target.copy(center);
          c.update();
        }
        fitted.current = true;
        return;
      }
      if (tries < 120) raf = requestAnimationFrame(attempt);
    };
    raf = requestAnimationFrame(attempt);
    return () => cancelAnimationFrame(raf);
  }, [camera, controls, size, margin]);

  return <group ref={groupRef}>{children}</group>;
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.25} />
      <Stars radius={300} depth={80} count={4000} factor={4} fade speed={0.4} />
      <Suspense fallback={null}>
        <Environment files="/assets/nebulas_4.hdr" background={false} />
        <AutoFit>
          <GltfNode url="/assets/center.glb" position={[0, 0, 0]} scale={1} />
          {CONSTELLATIONS.map((c) => (
            <GltfNode key={c.id} url={c.url} position={c.position} scale={c.scale} />
          ))}
        </AutoFit>
      </Suspense>
    </>
  );
}

export default function Galaxy() {
  return (
    <div className="fixed inset-0 bg-[#070b18]">
      <Canvas
        camera={{ position: [0, 5, 30], fov: 55, near: 0.01, far: 4000 }}
        gl={{ antialias: true, powerPreference: "high-performance" }}
        dpr={[1, 2]}
      >
        <color attach="background" args={["#070b18"]} />
        <Scene />
        <OrbitControls enablePan enableZoom enableRotate makeDefault />
      </Canvas>
    </div>
  );
}

