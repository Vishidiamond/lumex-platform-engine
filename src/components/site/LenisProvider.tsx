import { useEffect } from "react";
import Lenis from "lenis";
import { scrollStore } from "@/lib/scroll-store";
import { BEAT10 } from "./camera-config";

/**
 * Mounts a Lenis smooth-scroll instance and pipes normalized scroll progress
 * (0..1 across page height) into the shared scrollStore.
 *
 * Hold-after-arrival: when scrollProgress reaches 1.0 on a forward crossing,
 * the page locks for BEAT10.holdAfterArrivalMs (default 1.2s). During the
 * hold, wheel/touch/keyboard scroll is blocked so the closer can register
 * as a destination instead of being scrolled past.
 *
 * Honors prefers-reduced-motion by disabling smooth wheel.
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

    // ── Hold-after-arrival ──
    let holding = false;
    let armed = true; // re-arms after dropping below threshold by hysteresis
    const holdMs = BEAT10.holdAfterArrivalMs;

    const blockEvent = (e: Event) => {
      if (holding) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("wheel", blockEvent, { passive: false, capture: true });
    window.addEventListener("touchmove", blockEvent, { passive: false, capture: true });
    const blockKey = (e: KeyboardEvent) => {
      if (!holding) return;
      const blocked = ["ArrowDown", "ArrowUp", "PageDown", "PageUp", "End", "Home", " ", "Spacebar"];
      if (blocked.includes(e.key)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    window.addEventListener("keydown", blockKey, { capture: true });

    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      scrollStore.set(p);

      if (armed && p >= 1.0) {
        holding = true;
        armed = false;
        lenis.stop();
        // Pin to the bottom so any momentum doesn't push past.
        window.scrollTo(0, max);
        setTimeout(() => {
          holding = false;
          lenis.start();
        }, holdMs);
      } else if (!armed && p < 1.0 - 0.05) {
        // re-arm once the user has clearly scrolled back up
        armed = true;
      }
    };
    lenis.on("scroll", update);
    window.addEventListener("resize", update);
    update();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", update);
      window.removeEventListener("wheel", blockEvent, { capture: true } as EventListenerOptions);
      window.removeEventListener("touchmove", blockEvent, { capture: true } as EventListenerOptions);
      window.removeEventListener("keydown", blockKey, { capture: true } as EventListenerOptions);
      lenis.destroy();
    };
  }, []);

  return null;
}
