export type LocalEntitlements = {
  unlockedProductIds: string[];
  pdfCreditsUsedThisMonth: number;
  historicalCreditsUsedThisMonth: number;
  updatedAt: string;
};

const STORAGE_KEY = "legacy-wallcharts-entitlements-demo";

export function currentMonthKey() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

function defaultEntitlements(): LocalEntitlements {
  return {
    unlockedProductIds: [],
    pdfCreditsUsedThisMonth: 0,
    historicalCreditsUsedThisMonth: 0,
    updatedAt: new Date().toISOString(),
  };
}

export function loadLocalEntitlements(): LocalEntitlements {
  if (typeof window === "undefined") return defaultEntitlements();
  try {
    const raw = window.localStorage.getItem(`${STORAGE_KEY}:${currentMonthKey()}`);
    return raw ? { ...defaultEntitlements(), ...JSON.parse(raw) } : defaultEntitlements();
  } catch {
    return defaultEntitlements();
  }
}

export function saveLocalEntitlements(next: LocalEntitlements) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(`${STORAGE_KEY}:${currentMonthKey()}`, JSON.stringify({ ...next, updatedAt: new Date().toISOString() }));
}

export function demoUnlock(productId: string) {
  const current = loadLocalEntitlements();
  if (!current.unlockedProductIds.includes(productId)) current.unlockedProductIds.push(productId);
  saveLocalEntitlements(current);
  return current;
}

export function useDemoPdfCredit() {
  const current = loadLocalEntitlements();
  current.pdfCreditsUsedThisMonth += 1;
  saveLocalEntitlements(current);
  return current;
}
