import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import type { ReactNode } from "react";
import { Footer } from "@/components/site/Footer";

export function Drawer({
  isOpen,
  children,
}: {
  isOpen: boolean;
  children: ReactNode;
}) {
  const navigate = useNavigate();

  return (
    <aside
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
        overflowY: "auto",
        overflowX: "hidden",
        padding: "80px 40px 40px 40px",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 300ms cubic-bezier(0.4, 0, 0.2, 1)",
        color: "#e6ecf7",
      }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => navigate({ to: "/" })}
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
  );
}
