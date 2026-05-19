import { useEffect, useRef, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import { Volume2, VolumeX } from "lucide-react";

const KEY = "lumex_audio_enabled";
// TODO: Upload an ambient drone track to /public/audio/ambient.mp3
const SRC = "/audio/ambient.mp3";
const TARGET_VOLUME = 0.4;

export default function AudioToggle() {
  const { pathname } = useLocation();
  const [enabled, setEnabled] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem(KEY) === "1";
    setEnabled(stored);
  }, []);

  // Manage audio element
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!audioRef.current) {
      const a = new Audio(SRC);
      a.loop = true;
      a.volume = 0;
      audioRef.current = a;
    }
    return () => {
      if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
      audioRef.current?.pause();
    };
  }, []);

  const fade = (to: number, ms: number, after?: () => void) => {
    const a = audioRef.current;
    if (!a) return;
    if (fadeRef.current) cancelAnimationFrame(fadeRef.current);
    const from = a.volume;
    const start = performance.now();
    const step = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      a.volume = Math.max(0, Math.min(1, from + (to - from) * t));
      if (t < 1) {
        fadeRef.current = requestAnimationFrame(step);
      } else {
        fadeRef.current = null;
        after?.();
      }
    };
    fadeRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    if (enabled) {
      a.play()
        .then(() => fade(TARGET_VOLUME, 2000))
        .catch(() => {});
    } else {
      fade(0, 500, () => a.pause());
    }
  }, [enabled]);

  if (pathname !== "/") return null;

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    localStorage.setItem(KEY, next ? "1" : "0");
  };

  return (
    <button
      onClick={toggle}
      aria-label={enabled ? "Mute ambient audio" : "Play ambient audio"}
      style={{
        position: "fixed",
        bottom: 24,
        right: 24,
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "rgba(255,255,255,0.08)",
        border: "1px solid rgba(255,255,255,0.15)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(255,255,255,0.8)",
        cursor: "pointer",
        zIndex: 30,
      }}
    >
      {enabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
    </button>
  );
}
