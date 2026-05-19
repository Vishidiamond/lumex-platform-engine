import { useMemo } from "react";
import * as THREE from "three";

const STAR_COUNT = 5000;
const INNER_R = 15;
const OUTER_R = 80;

const vertexShader = /* glsl */ `
  attribute float aSize;
  attribute vec3 aColor;
  varying vec3 vColor;
  void main() {
    vColor = aColor;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mv;
    // size in world units -> pixel size based on distance
    gl_PointSize = aSize * (300.0 / -mv.z);
  }
`;

const fragmentShader = /* glsl */ `
  varying vec3 vColor;
  void main() {
    vec2 uv = gl_PointCoord - 0.5;
    float d = length(uv);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    gl_FragColor = vec4(vColor, alpha);
  }
`;

export default function Starfield() {
  const { geometry, material } = useMemo(() => {
    const positions = new Float32Array(STAR_COUNT * 3);
    const colors = new Float32Array(STAR_COUNT * 3);
    const sizes = new Float32Array(STAR_COUNT);

    const cool = new THREE.Color("#cfd9e8");
    const warmA = new THREE.Color("#ff9b6b");
    const warmB = new THREE.Color("#ffb87a");

    for (let i = 0; i < STAR_COUNT; i++) {
      // uniform direction
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = INNER_R + Math.random() * (OUTER_R - INNER_R);
      const sinPhi = Math.sin(phi);
      positions[i * 3] = r * sinPhi * Math.cos(theta);
      positions[i * 3 + 1] = r * sinPhi * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      let c: THREE.Color;
      if (Math.random() < 0.85) {
        c = cool;
      } else {
        c = warmA.clone().lerp(warmB, Math.random());
      }
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = 0.01 + Math.random() * 0.05;
    }

    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    g.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));

    const m = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    return { geometry: g, material: m };
  }, []);

  return <points geometry={geometry} material={material} />;
}
