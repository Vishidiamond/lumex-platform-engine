import { useEffect } from "react";
import { useRouterState } from "@tanstack/react-router";
import { CONSTELLATIONS } from "./constellations";
import { useGalaxyStore } from "./galaxyStore";

// Routes that should NOT change the camera focus.
const NEUTRAL_ROUTES = new Set([
  "/diamonds",
  "/house",
  "/about",
  "/press",
  "/contact",
]);

/** Non-rendering bridge: keeps the galaxy focus in sync with the URL.
 *  - / → lumex
 *  - /platform → lumex-online (Phase 5 will additionally redirect to /lumex-online)
 *  - /technology → nsphere
 *  - /lumex, /lumex-online, /nsphere, /atelier-amara, /fortunoff → matching id
 *  - /diamonds, /house, /about, /press, /contact → leave focus untouched
 */
export default function RouteFocusBridge() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const setFocus = useGalaxyStore((s) => s.setFocus);

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
