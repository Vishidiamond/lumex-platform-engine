import { useEffect, useRef, useState } from "react";
import { sceneState } from "@/lib/scene-state";

/**
 * Atmospheric sub-bass system. Synthesized in-browser via Web Audio API.
 * Muted by default; small toggle in lower-right enables it. Audio is felt
 * more than heard — pairs to scroll-driven cinematic moments without ever
 * carrying them.
 */

const SESSION_KEY = "ambient-audio-enabled";

function buildReverbImpulse(ctx: AudioContext, seconds = 3): AudioBuffer {
  const rate = ctx.sampleRate;
  const length = Math.floor(rate * seconds);
  const buf = ctx.createBuffer(2, length, rate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      const t = i / length;
      // exponential decay shaped white noise
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 3.5);
    }
  }
  return buf;
}

export function AudioToggle() {
  const [enabled, setEnabled] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);

  // Audio graph refs
  const ctxRef = useRef<AudioContext | null>(null);
  const masterRef = useRef<GainNode | null>(null);
  const baseGainRef = useRef<GainNode | null>(null);
  const harmGainRef = useRef<GainNode | null>(null);
  const startedRef = useRef(false);
  const rafRef = useRef(0);

  // Pullback hold state
  const holdStartedAtRef = useRef<number | null>(null);
  const fadeOutStartedAtRef = useRef<number | null>(null);

  // Detect viewport (desktop only) + restore session state
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const apply = () => setIsDesktop(mq.matches);
    apply();
    mq.addEventListener("change", apply);
    try {
      if (sessionStorage.getItem(SESSION_KEY) === "1") setEnabled(true);
    } catch {
      /* ignore */
    }
    return () => mq.removeEventListener("change", apply);
  }, []);

  // Build audio graph once when first needed
  const ensureGraph = async () => {
    if (ctxRef.current) {
      if (ctxRef.current.state === "suspended") await ctxRef.current.resume();
      return;
    }
    const Ctx = (window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext) as typeof AudioContext | undefined;
    if (!Ctx) return;
    const ctx = new Ctx();

    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // Lowpass to keep everything sub-perceptual as tone
    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 200;
    filter.Q.value = 1.0;

    // Convolver for cosmic space
    const convolver = ctx.createConvolver();
    convolver.buffer = buildReverbImpulse(ctx, 3);

    // Wet/dry blend (mostly wet for atmosphere)
    const dry = ctx.createGain();
    dry.gain.value = 0.6;
    const wet = ctx.createGain();
    wet.gain.value = 0.7;

    filter.connect(dry).connect(master);
    filter.connect(convolver).connect(wet).connect(master);

    // Base oscillators (50, 75 Hz) → baseGain → filter
    const baseGain = ctx.createGain();
    baseGain.gain.value = 0;
    baseGain.connect(filter);

    const o50 = ctx.createOscillator();
    o50.type = "sine";
    o50.frequency.value = 50;
    o50.connect(baseGain);
    o50.start();

    const o75 = ctx.createOscillator();
    o75.type = "sine";
    o75.frequency.value = 75;
    const o75g = ctx.createGain();
    o75g.gain.value = 0.7;
    o75.connect(o75g).connect(baseGain);
    o75.start();

    // Harmonic oscillator (150 Hz) → harmGain → filter
    const harmGain = ctx.createGain();
    harmGain.gain.value = 0;
    harmGain.connect(filter);

    const o150 = ctx.createOscillator();
    o150.type = "sine";
    o150.frequency.value = 150;
    o150.connect(harmGain);
    o150.start();

    ctxRef.current = ctx;
    masterRef.current = master;
    baseGainRef.current = baseGain;
    harmGainRef.current = harmGain;
    startedRef.current = true;
  };

  // Toggle effect: animate master gain
  useEffect(() => {
    if (!isDesktop) return;
    try {
      sessionStorage.setItem(SESSION_KEY, enabled ? "1" : "0");
    } catch {
      /* ignore */
    }

    let cancelled = false;
    const apply = async () => {
      if (enabled) await ensureGraph();
      const ctx = ctxRef.current;
      const master = masterRef.current;
      if (!ctx || !master || cancelled) return;
      const now = ctx.currentTime;
      master.gain.cancelScheduledValues(now);
      master.gain.setValueAtTime(master.gain.value, now);
      master.gain.linearRampToValueAtTime(enabled ? 0.4 : 0, now + 1);
    };
    apply();
    return () => {
      cancelled = true;
    };
  }, [enabled, isDesktop]);

  // Per-frame envelope tied to scrollProgress + sceneState
  useEffect(() => {
    if (!isDesktop) return;

    let lastScrollProgress = 0;
    let crossedOne = false;

    const tick = () => {
      const ctx = ctxRef.current;
      const base = baseGainRef.current;
      const harm = harmGainRef.current;

      if (ctx && base && harm && enabled) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const sp = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;

        // Base envelope shaped by scrollProgress
        let baseTarget = 0;
        if (sp < 0.08) {
          baseTarget = (sp / 0.08) * 0.15; // mission read fade-in
        } else if (sp < 0.16) {
          baseTarget = 0.15;
        } else if (sp < 0.86) {
          // Body of the journey: transit swells + arrival dips
          const transit = sceneState.transitness;
          const arrival = sceneState.arrivalness;
          baseTarget = 0.15 + transit * 0.20 - arrival * 0.05;
          // Beat 2 reveal swell at 0.16
          const d = sp - 0.16;
          baseTarget += Math.exp(-(d * d) / 0.0008) * 0.10;
        } else {
          // Pullback 0.86 → 1.0
          const k = (sp - 0.86) / 0.14;
          baseTarget = 0.15 + Math.min(1, k) * 0.30;
        }

        // Harmonic: peaks on arrivals + pullback
        let harmTarget = sceneState.arrivalness * 0.08;
        if (sp >= 0.86) {
          const k = (sp - 0.86) / 0.14;
          harmTarget = Math.max(harmTarget, Math.min(1, k) * 0.18);
        }

        // Pullback hold + fade-out
        if (sp >= 0.999 && !crossedOne && lastScrollProgress < 0.999) {
          crossedOne = true;
          holdStartedAtRef.current = performance.now();
        }
        if (sp < 0.95 && crossedOne) {
          // user scrolled away — reset latches
          crossedOne = false;
          holdStartedAtRef.current = null;
          fadeOutStartedAtRef.current = null;
        }
        if (holdStartedAtRef.current != null) {
          const elapsed = performance.now() - holdStartedAtRef.current;
          if (elapsed < 1200) {
            // hold steady at peak
            baseTarget = 0.45;
            harmTarget = 0.18;
          } else {
            if (fadeOutStartedAtRef.current == null) {
              fadeOutStartedAtRef.current = performance.now();
            }
            const fadeT = (performance.now() - fadeOutStartedAtRef.current) / 2000;
            const k = Math.max(0, 1 - fadeT);
            baseTarget = 0.45 * k;
            harmTarget = 0.18 * k;
          }
        }
        lastScrollProgress = sp;

        const now = ctx.currentTime;
        base.gain.setTargetAtTime(baseTarget, now, 0.18);
        harm.gain.setTargetAtTime(harmTarget, now, 0.20);
      }

      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [enabled, isDesktop]);

  // Cleanup
  useEffect(() => {
    return () => {
      cancelAnimationFrame(rafRef.current);
      const ctx = ctxRef.current;
      if (ctx) ctx.close().catch(() => undefined);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-center gap-1.5">
      <span
        className="text-[9px] uppercase tracking-[0.4em] text-white/50 select-none"
        style={{ fontFamily: "var(--font-mono, inherit)" }}
      >
        AMBIENT
      </span>
      <button
        type="button"
        onClick={() => setEnabled((v) => !v)}
        aria-label={enabled ? "Mute ambient audio" : "Enable ambient audio"}
        aria-pressed={enabled}
        className="flex h-8 w-8 items-center justify-center rounded-full transition-opacity"
        style={{ opacity: enabled ? 0.8 : 0.4 }}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill={enabled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.25"
          strokeLinejoin="round"
          strokeLinecap="round"
          className="text-foreground"
          aria-hidden="true"
        >
          <path d="M3 6h2.5L9 3v10L5.5 10H3z" />
          {!enabled && (
            <>
              <line x1="11" y1="6" x2="14" y2="9" />
              <line x1="14" y1="6" x2="11" y2="9" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
