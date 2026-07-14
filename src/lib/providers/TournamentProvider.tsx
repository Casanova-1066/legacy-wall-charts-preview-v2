import { useState, type ReactNode } from "react";
import { hydrateFromStorage, seedData, persistData } from "@/lib/data/dataStore";
import { SEED_DATA } from "@/lib/data/seedData";

let didInit = false;

export function TournamentProvider({ children }: { children: ReactNode }) {
  useState(() => {
    if (didInit) return;
    didInit = true;
    const hydrated = hydrateFromStorage();
    if (!hydrated) {
      seedData(SEED_DATA as any);
      persistData();
    }
    return true;
  });

  return <>{children}</>;
}
