import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";

const KEY = "lumex_hint_dismissed";

export default function InteractionHint() {
  const { pathname } = useLocation();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(KEY) === "1") return;

    setMounted(true);
    const tIn = setTimeout(() => setVisible(true), 50);
    const tFade = setTimeout(() => setVisible(false), 4000);
    const tUnmount = setTimeout(() => {
      setMounted(false);
      localStorage.setItem(KEY, "1");
    }, 4500);

    return () => {
      clearTimeout(tIn);
      clearTimeout(tFade);
      clearTimeout(tUnmount);
    };
  }, [pathname]);

  if (!mounted) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 40,
        left: "50%",
        transform: "translateX(-50%)",
        color: "rgba(255,255,255,0.5)",
        fontSize: 13,
        letterSpacing: "0.04em",
        fontFamily:
          "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        opacity: visible ? 1 : 0,
        transition: "opacity 500ms ease",
        pointerEvents: "none",
        zIndex: 30,
        whiteSpace: "nowrap",
      }}
    >
      Drag to explore the sky. Click a constellation to enter.
    </div>
  );
}
