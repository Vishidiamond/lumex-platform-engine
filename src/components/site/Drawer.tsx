import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { useEffect, useRef, type ReactNode } from "react";
import { Footer } from "@/components/site/Footer";

export function Drawer({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();
  const asideRef = useRef<HTMLElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const lastFocused = useRef<HTMLElement | null>(null);

  const close = () => navigate({ to: "/" });

  // Escape to close + basic focus trap
  useEffect(() => {
    if (!isOpen) return;
    lastFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close();
        return;
      }
      if (e.key !== "Tab" || !asideRef.current) return;
      const focusables = asideRef.current.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      lastFocused.current?.focus?.();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  return (
    <>
      {/* Scrim catches click-outside */}
      <div
        onClick={close}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(7, 11, 24, 0.35)",
          zIndex: 19,
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
          transition: "opacity 300ms ease",
        }}
      />
      <aside
        ref={asideRef}
        role="dialog"
        aria-modal={isOpen ? "true" : undefined}
        aria-label="Section detail"
        aria-hidden={!isOpen}
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          height: "100vh",
          width: "min(560px, 90vw)",
          background: "rgba(7, 11, 24, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderLeft: "1px solid rgba(255, 255, 255, 0.08)",
          zIndex: 20,
          pointerEvents: isOpen ? "auto" : "none",
          overflowY: isOpen ? "auto" : "hidden",
          overflowX: "hidden",
          padding: "80px 40px 40px 40px",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
          visibility: isOpen ? "visible" : "hidden",
          color: "#e6ecf7",
        }}
      >
        <button
          ref={closeBtnRef}
          type="button"
          aria-label="Close"
          onClick={close}
          style={{
            position: "absolute",
            top: 40,
            right: 40,
            width: 32,
            height: 32,
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 4,
            color: "rgba(255,255,255,0.9)",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <X size={16} />
        </button>

        <div style={{ maxWidth: 480, margin: "0 auto" }}>
          {children}
          <div style={{ marginTop: 64 }}>
            <Footer />
          </div>
        </div>
      </aside>
    </>
  );
}
