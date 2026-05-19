import { useEffect, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { CONSTELLATIONS_BY_ID } from "./constellations";
import { useGalaxyStore } from "./galaxyStore";

// 1.1s smoothstep tween of camera.position + OrbitControls.target.
const DURATION = 1.1;

type Anim = {
  t: number;
  fromPos: THREE.Vector3;
  toPos: THREE.Vector3;
  fromTarget: THREE.Vector3;
  toTarget: THREE.Vector3;
  active: boolean;
};

export default function CameraController() {
  const { camera, controls } = useThree();
  const focusedId = useGalaxyStore((s) => s.focusedConstellationId);

  const anim = useRef<Anim>({
    t: 0,
    fromPos: new THREE.Vector3(),
    toPos: new THREE.Vector3(),
    fromTarget: new THREE.Vector3(),
    toTarget: new THREE.Vector3(),
    active: false,
  });

  useEffect(() => {
    if (!focusedId) return;
    const c = CONSTELLATIONS_BY_ID[focusedId];
    if (!c) return;
    const ctrl = controls as unknown as { target: THREE.Vector3 } | null;
    if (!ctrl?.target) return;

    const targetPos = new THREE.Vector3(...c.position);
    // Keep current viewing direction, pull camera 15% closer to the constellation.
    const direction = camera.position.clone().sub(ctrl.target).normalize();
    const distance = camera.position.distanceTo(ctrl.target);
    const endPos = targetPos
      .clone()
      .add(direction.multiplyScalar(Math.max(distance * 0.85, 6)));

    anim.current.fromPos.copy(camera.position);
    anim.current.toPos.copy(endPos);
    anim.current.fromTarget.copy(ctrl.target);
    anim.current.toTarget.copy(targetPos);
    anim.current.t = 0;
    anim.current.active = true;
  }, [focusedId, camera, controls]);

  useFrame((_, delta) => {
    const a = anim.current;
    if (!a.active) return;
    const ctrl = controls as unknown as
      | { target: THREE.Vector3; update: () => void }
      | null;

    a.t = Math.min(1, a.t + delta / DURATION);
    const u = a.t * a.t * (3 - 2 * a.t); // smoothstep

    camera.position.lerpVectors(a.fromPos, a.toPos, u);
    if (ctrl?.target) {
      ctrl.target.lerpVectors(a.fromTarget, a.toTarget, u);
      ctrl.update();
    } else {
      const look = a.fromTarget.clone().lerp(a.toTarget, u);
      camera.lookAt(look);
    }

    if (a.t >= 1) a.active = false;
  });

  return null;
}
