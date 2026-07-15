export type PlatformHealth = {
  ready: boolean;
  checkedAt: string;
  checks: Record<string, { ok: boolean; detail?: string }>;
};

export async function fetchPlatformHealth() {
  const response = await fetch('/api/health', { headers: { accept: 'application/json' } });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok && !payload?.checks) throw new Error(payload?.error || 'Platform health check failed.');
  return payload as PlatformHealth;
}
