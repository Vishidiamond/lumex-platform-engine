import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CONSTELLATIONS } from "@/galaxy/constellations";
import { useGalaxyStore } from "@/galaxy/galaxyStore";

const MOBILE_BREAKPOINT = 780;

export function Header() {
  const [open, setOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Track viewport width; auto-close mobile menu above breakpoint.
  useEffect(() => {
    const check = () => {
      const mobile = window.innerWidth < MOBILE_BREAKPOINT;
      setIsMobile(mobile);
      if (!mobile) setOpen(false);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Escape closes mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const handleLinkClick = (id: (typeof CONSTELLATIONS)[number]["id"]) => {
    useGalaxyStore.getState().setFocus(id);
    setOpen(false);
  };

  return (
    <header
      style={{
        position: "fixed",
        top: 18,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 50,
        pointerEvents: "auto",
      }}
    >
      {/* Pill container */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 24,
          height: 72,
          padding: "0 24px",
          borderRadius: 14,
          background: "rgba(255, 255, 255, 0.08)",
          border: "1px solid rgba(255, 255, 255, 0.12)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
        }}
      >
        {!isMobile &&
          CONSTELLATIONS.map((c) => (
            <Link
              key={c.id}
              to={c.route}
              onClick={() => handleLinkClick(c.id)}
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                textDecoration: "none",
                letterSpacing: "0.02em",
                opacity: 0.7,
                transition: "opacity 200ms",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = "1")}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = "0.7")}
              activeProps={{ style: { opacity: 1 } }}
            >
              {c.name}
            </Link>
          ))}

        {isMobile && (
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: 22,
              cursor: "pointer",
              padding: "0 8px",
              lineHeight: 1,
            }}
          >
            ☰
          </button>
        )}
      </div>

      {/* Mobile drawer */}
      {isMobile && open && (
        <nav
          style={{
            marginTop: 8,
            display: "flex",
            flexDirection: "column",
            gap: 4,
            padding: "12px 16px",
            borderRadius: 14,
            background: "rgba(255, 255, 255, 0.08)",
            border: "1px solid rgba(255, 255, 255, 0.12)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
          }}
        >
          {CONSTELLATIONS.map((c) => (
            <Link
              key={c.id}
              to={c.route}
              onClick={() => handleLinkClick(c.id)}
              style={{
                color: "rgba(255, 255, 255, 0.9)",
                fontSize: 14,
                textDecoration: "none",
                letterSpacing: "0.02em",
                padding: "10px 8px",
              }}
              activeProps={{ style: { opacity: 1 } }}
            >
              {c.name}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
