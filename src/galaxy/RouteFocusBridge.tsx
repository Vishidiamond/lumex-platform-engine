import { useEffect } from "react";
import { useNavigate, useRouterState } from "@tanstack/react-router";
import { CONSTELLATIONS } from "./constellations";
import { useGalaxyStore } from "./galaxyStore";

// Routes that should NOT change the camera focus (drawer-only content).
const NEUTRAL_ROUTES = new Set([
  "/diamonds",
  "/house",
  "/about",
  "/press",
  "/contact",
]);

export default function RouteFocusBridge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setFocus = useGalaxyStore((s) => s.setFocus);
  const navigate = useNavigate();

  // Legacy → canonical redirects.
  useEffect(() => {
    if (pathname === "/platform") {
      navigate({ to: "/lumex-online", replace: true });
    } else if (pathname === "/technology") {
      navigate({ to: "/nsphere", replace: true });
    }
  }, [pathname, navigate]);

  useEffect(() => {
    if (NEUTRAL_ROUTES.has(pathname)) return;

    if (pathname === "/") {
      setFocus("lumex");
      return;
    }
    if (pathname === "/platform") {
      setFocus("lumex-online");
      return;
    }
    if (pathname === "/technology") {
      setFocus("nsphere");
      return;
    }

    const match = CONSTELLATIONS.find((c) => c.route === pathname);
    if (match) setFocus(match.id);
  }, [pathname, setFocus]);

  return null;
}
