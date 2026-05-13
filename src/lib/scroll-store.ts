/**
 * Tiny shared store for normalized scroll progress (0..1).
 * Driven by Lenis; consumed by the WebGL camera rig and any DOM listeners.
 */
type Listener = (p: number) => void;

let progress = 0;
const listeners = new Set<Listener>();

export const scrollStore = {
  get: () => progress,
  set: (p: number) => {
    progress = p;
    listeners.forEach((l) => l(p));
  },
  subscribe: (l: Listener) => {
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  },
};
