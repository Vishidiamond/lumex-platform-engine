import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";

export default function Galaxy() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) {
    return <div style={{ position: "fixed", inset: 0, background: "#070b18" }} />;
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "#070b18" }}>
      <Canvas
        style={{ width: "100%", height: "100%", display: "block" }}
        camera={{ position: [0, 0, 5], fov: 55 }}
      >
        <color attach="background" args={["#ff00ff"]} />
        <ambientLight intensity={1} />
        <mesh>
          <boxGeometry args={[2, 2, 2]} />
          <meshStandardMaterial color="orange" />
        </mesh>
      </Canvas>
    </div>
  );
}
