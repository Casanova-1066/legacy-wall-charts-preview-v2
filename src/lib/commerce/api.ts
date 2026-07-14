import { getAccessToken } from '@/integrations/neon/auth';

async function authHeaders() {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in before continuing to checkout.');
  return { authorization: `Bearer ${token}`, 'content-type': 'application/json' };
}

export async function createCheckoutSession(product: string, resourceId?: string | null) {
  const response = await fetch('/api/stripe/create-checkout-session', {
    method: 'POST',
    headers: await authHeaders(),
    body: JSON.stringify({ product, resourceId: resourceId || null }),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Checkout could not be started.');
  return payload as { url: string };
}

export async function openCustomerPortal() {
  const response = await fetch('/api/stripe/customer-portal', { method: 'POST', headers: await authHeaders(), body: '{}' });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Billing portal could not be opened.');
  return payload as { url: string };
}

export async function checkoutStatus(sessionId: string) {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in to verify this purchase.');
  const response = await fetch(`/api/stripe/session-status?session_id=${encodeURIComponent(sessionId)}`, {
    headers: { authorization: `Bearer ${token}` },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Purchase status could not be verified.');
  return payload as { paymentStatus: string; checkoutStatus: string; fulfilled: boolean; product?: string | null; resourceId?: string | null };
}
