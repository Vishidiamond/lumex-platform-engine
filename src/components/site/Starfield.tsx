import { useEffect, useRef } from "react";

/**
 * Fixed full-viewport star field. The camera "glides" forward as the user
 * scrolls: stars drift outward from a vanishing point and twinkle softly.
 * Pure canvas, no deps. Browser APIs are guarded with useEffect.
 */
export function Starfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const scrollRef = useRef(0);
  const targetScrollRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const STAR_COUNT = 320;

    type Star = {
      x: number; // -0.5..0.5 (relative to center)
      y: number; // -0.5..0.5
      z: number; // 0..1 depth
      r: number; // base radius
      tw: number; // twinkle phase
    };

    let stars: Star[] = [];
    let w = 0;
    let h = 0;
    let raf = 0;

    const seed = () => {
      stars = Array.from({ length: STAR_COUNT }, () => ({
        x: Math.random() - 0.5,
        y: Math.random() - 0.5,
        z: Math.random(),
        r: Math.random() * 1.2 + 0.2,
        tw: Math.random() * Math.PI * 2,
      }));
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      targetScrollRef.current = max > 0 ? window.scrollY / max : 0;
    };

    const draw = (t: number) => {
      // Smooth scroll progress
      scrollRef.current += (targetScrollRef.current - scrollRef.current) * 0.06;
      const p = scrollRef.current;

      // Clear with deep navy
      ctx.fillStyle = "#070b18";
      ctx.fillRect(0, 0, w, h);

      // Subtle vignette glow
      const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
      grad.addColorStop(0, "rgba(40, 70, 140, 0.18)");
      grad.addColorStop(1, "rgba(7, 11, 24, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, w, h);

      const cx = w / 2;
      const cy = h / 2;
      const time = t * 0.0008;

      // Camera "turn" — small lateral drift on transit beats
      const turn = Math.sin(p * Math.PI * 4) * 30;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        // depth-driven motion: closer stars (high z) move faster outward as we scroll
        const depth = (s.z + p * 1.4) % 1;
        const scale = 1 / (1.05 - depth);
        const x = cx + s.x * w * scale + turn * (1 - depth);
        const y = cy + s.y * h * scale;

        if (x < -10 || x > w + 10 || y < -10 || y > h + 10) continue;

        const twinkle = 0.55 + 0.45 * Math.sin(time + s.tw);
        const alpha = depth * twinkle;
        const radius = s.r * (0.6 + depth * 1.6);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${200 + Math.floor(depth * 55)}, ${215 + Math.floor(depth * 40)}, 255, ${alpha})`;
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };

    seed();
    resize();
    onScroll();
    raf = requestAnimationFrame(draw);

    window.addEventListener("resize", resize);
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 h-screen w-screen"
      style={{ background: "#070b18" }}
    />
  );
}
