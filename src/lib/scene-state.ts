import * as THREE from "three";

/**
 * Scene-state singleton written by the camera rig each frame and read by
 * sibling effects (streaks, foreshadow pulses, dense-transit stars, audio).
 * Avoids prop-drilling per-frame data through React.
 */
export const sceneState = {
  cameraPos: new THREE.Vector3(),
  /** Per-frame camera velocity (units/sec). */
  cameraVel: new THREE.Vector3(),
  /** Speed = |cameraVel|, smoothed. */
  speed: 0,
  transitness: 0,
  arrivalness: 0,
  segIndex: 0,
  segT: 0,
  reduceMotion: false,
};
