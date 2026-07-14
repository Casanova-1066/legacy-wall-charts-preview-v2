// Neon Auth (better-auth) raw fetch client used by Legacy Wall Charts.
// Browser auth cookies live on the Neon Auth host, so every request must use
// credentials: "include" and the live site origin must be trusted in Neon.

const RAW_AUTH_URL: string | undefined = import.meta.env.VITE_NEON_AUTH_URL;
export const AUTH_URL = (RAW_AUTH_URL ?? "").replace(/\/$/, "");

export type NeonUser = { id: string; email: string; name?: string | null; image?: string | null; role?: string | null };
export type AuthHealth = {
  configured: boolean;
  authUrl?: string;
  origin?: string;
  sessionReachable: boolean;
  sessionStatus?: number;
  message?: string;
};

function assertAuthConfigured() {
  if (!AUTH_URL) {
    throw new Error("Sign in is not configured. Add VITE_NEON_AUTH_URL in Vercel Environment Variables and redeploy.");
  }
}

function authUrl(path: string) {
  assertAuthConfigured();
  return `${AUTH_URL}${path}`;
}

function req(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(authUrl(path), {
    ...init,
    credentials: "include",
    headers: { "content-type": "application/json", accept: "application/json", ...(init.headers || {}) },
  });
}

function jwtExpMs(token: string): number {
  try {
    const { exp } = JSON.parse(atob(token.split(".")[1]));
    return typeof exp === "number" ? exp * 1000 : Date.now() + 10 * 60_000;
  } catch {
    return Date.now() + 10 * 60_000;
  }
}

let user: NeonUser | null = null;
let signedIn = false;
let jwt: { token: string; expMs: number } | null = null;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

export function subscribe(fn: () => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function currentUser(): NeonUser | null {
  return user;
}

export function getAuthDiagnostics() {
  return {
    configured: !!AUTH_URL,
    authUrl: AUTH_URL || undefined,
    origin: typeof window !== "undefined" ? window.location.origin : undefined,
  };
}

async function errMessage(r: Response): Promise<string> {
  let payload: any = null;
  try { payload = await r.json(); } catch {}
  const raw = payload?.message || payload?.error || `Request failed (${r.status})`;
  const message = String(raw);
  const lower = message.toLowerCase();
  if (lower.includes("invalid origin") || lower.includes("origin")) {
    const origin = typeof window !== "undefined" ? window.location.origin : "this site origin";
    return `Sign in is blocked by Neon Auth for ${origin}. Add this exact origin to Neon Auth trusted origins/allowed origins and redeploy. If it is already listed, confirm VITE_NEON_AUTH_URL points to the same Neon Auth project.`;
  }
  if (r.status === 401 || r.status === 403) return `${message}. Please check the email/password and Neon Auth settings.`;
  return message;
}

export async function refreshSession(): Promise<NeonUser | null> {
  try {
    const r = await req("/get-session");
    const j = r.ok ? await r.json() : null;
    user = (j?.user as NeonUser) ?? null;
  } catch {
    user = null;
  }
  signedIn = !!user;
  if (!signedIn) jwt = null;
  emit();
  return user;
}

export async function getAccessToken(): Promise<string | null> {
  if (!signedIn) return null;
  if (jwt && jwt.expMs - 30_000 > Date.now()) return jwt.token;
  try {
    const r = await req("/token");
    if (!r.ok) {
      jwt = null;
      return null;
    }
    const { token } = (await r.json()) as { token: string };
    jwt = { token, expMs: jwtExpMs(token) };
    return token;
  } catch {
    return null;
  }
}

export async function signUp(email: string, password: string, name?: string): Promise<void> {
  const r = await req("/sign-up/email", { method: "POST", body: JSON.stringify({ email, password, name: name || email.split("@")[0] }) });
  if (!r.ok) throw new Error(await errMessage(r));
  jwt = null;
  await refreshSession();
}

export async function signIn(email: string, password: string): Promise<void> {
  const r = await req("/sign-in/email", { method: "POST", body: JSON.stringify({ email, password }) });
  if (!r.ok) throw new Error(await errMessage(r));
  jwt = null;
  await refreshSession();
}


export async function requestPasswordReset(email: string, redirectTo: string): Promise<void> {
  const r = await req("/request-password-reset", {
    method: "POST",
    body: JSON.stringify({ email, redirectTo }),
  });
  if (!r.ok) throw new Error(await errMessage(r));
}

export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const r = await req("/reset-password", {
    method: "POST",
    body: JSON.stringify({ token, newPassword }),
  });
  if (!r.ok) throw new Error(await errMessage(r));
  jwt = null;
  await refreshSession();
}

export async function signOut(): Promise<void> {
  try {
    await req("/sign-out", { method: "POST", body: "{}" });
  } finally {
    user = null;
    signedIn = false;
    jwt = null;
    emit();
  }
}

export async function authHealthCheck(): Promise<AuthHealth> {
  const base = getAuthDiagnostics();
  if (!base.configured) return { ...base, sessionReachable: false, message: "VITE_NEON_AUTH_URL is missing." };
  try {
    const r = await req("/get-session");
    return {
      ...base,
      sessionReachable: true,
      sessionStatus: r.status,
      message: r.ok ? "Neon Auth is reachable from this origin." : await errMessage(r),
    };
  } catch (error: any) {
    return {
      ...base,
      sessionReachable: false,
      message: error?.message || "Could not reach Neon Auth. Check the auth URL and CORS/trusted origin settings.",
    };
  }
}
