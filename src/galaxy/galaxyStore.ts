import { create } from "zustand";
import type { Constellation } from "./constellations";

type GalaxyState = {
  focusedConstellationId: Constellation["id"] | null;
  setFocus: (id: Constellation["id"] | null) => void;
};

export const useGalaxyStore = create<GalaxyState>((set) => ({
  focusedConstellationId: "lumex",
  setFocus: (id) => set({ focusedConstellationId: id }),
}));
