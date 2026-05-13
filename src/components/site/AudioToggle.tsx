import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { sceneState } from "@/lib/scene-state";

/**
 * Atmospheric sub-bass swell. Muted by default. Once enabled, gain follows
 * the active transit's transitness with a slow envelope. Web Audio is created
 * lazily on first activation (browser policy requires user gesture).
 */
export function AudioToggle() {
  const [enabled, setEnabled] = useState(false);
  const ctxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const oscHiRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const rafRef = useRef(0);

  const start = async () => {
    if (ctxRef.current) {
      await ctxRef.current.resume();
      return;
    }
    const Ctx = (window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext) as typeof AudioContext;
    if (!Ctx) return;
    const ctx = new Ctx();
    const gain = ctx.createGain();
    gain.gain.value = 0;
    gain.connect(ctx.destination);
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = 48;
    osc.connect(gain);
    osc.start();
    const oscHi = ctx.createOscillator();
    oscHi.type = "sine";
    oscHi.frequency.value = 72;
    const hiGain = ctx.createGain();
    hiGain.gain.value = 0.4;
    oscHi.connect(hiGain).connect(gain);
    oscHi.start();
    ctxRef.current = ctx;
    oscRef.current = osc;
    oscHiRef.current = oscHi;
    gainRef.current = gain;
  };

  const stop = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.suspend();
  };

  // Per-frame envelope follower
  useEffect(() => {
    if (!enabled) {
      stop();
      cancelAnimationFrame(rafRef.current);
      return;
    }
    let mounted = true;
    start().then(() => {
      if (!mounted) return;
      const tick = () => {
        const g = gainRef.current;
        if (g && ctxRef.current) {
          // Peak around foreshadow; very faint overall.
          const target = sceneState.transitness * 0.06;
          g.gain.setTargetAtTime(target, ctxRef.current.currentTime, 0.25);
        }
        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    });
    return () => {
      mounted = false;
      cancelAnimationFrame(rafRef.current);
      stop();
    };
  }, [enabled]);

  return (
    <button
      type="button"
      onClick={() => setEnabled((v) => !v)}
      aria-label={enabled ? "Mute atmospheric audio" : "Enable atmospheric audio"}
      aria-pressed={enabled}
      className="fixed bottom-5 right-5 z-40 flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.04] px-3 py-2 text-[10px] uppercase tracking-[0.3em] text-white/70 backdrop-blur-md transition hover:border-white/35 hover:text-white/90"
      style={{ fontFamily: "var(--font-mono)" }}
    >
      {enabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5" />}
      <span className="hidden sm:inline">{enabled ? "Sound on" : "Sound"}</span>
    </button>
  );
}
