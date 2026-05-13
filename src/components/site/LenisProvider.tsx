import { useEffect } from "react";
import Lenis from "lenis";
import { scrollStore } from "@/lib/scroll-store";

/**
 * Mounts a Lenis smooth-scroll instance and pipes normalized scroll progress
 * (0..1 across page height) into the shared scrollStore. Honors
 * prefers-reduced-motion by disabling smooth wheel.
 */
export function LenisProvider() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const lenis = new Lenis({
      duration: 1.4,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !reduce,
    });

    let raf = 0;
    const tick = (time: number) => {
      lenis.raf(time);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      scrollStore.set(max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0);
    };
    lenis.on("scroll", update);
    window.addEventListener("resize", update);
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      lenis.destroy();
    };
  }, []);

  return null;
}
