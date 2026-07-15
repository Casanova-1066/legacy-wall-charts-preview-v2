import { getAccessToken } from '@/integrations/neon/auth';

export type CreditBalance = { allowance: number | null; used: number };
export type AccountSummary = {
  user: { id: string; email?: string };
  plan: null | {
    key: string;
    label: string;
    status: string;
    currentPeriodEnd: string | null;
    cancelAtPeriodEnd: boolean;
  };
  credits: { pdf: CreditBalance; historical: CreditBalance };
  purchases: Array<{
    id: string;
    product_key: string;
    resource_id: string | null;
    status: string;
    amount_total: number;
    currency: string;
    created_at: string;
  }>;
  subscriptions: Array<{
    id: string;
    product_key: string;
    status: string;
    current_period_end: string | null;
    cancel_at_period_end: boolean;
    updated_at: string;
  }>;
};

export async function fetchAccountSummary(): Promise<AccountSummary> {
  const token = await getAccessToken();
  if (!token) throw new Error('Please sign in again to load account details.');
  const response = await fetch('/api/account/summary', {
    headers: { authorization: `Bearer ${token}`, accept: 'application/json' },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || 'Account details could not be loaded.');
  return payload as AccountSummary;
}

export function creditText(balance: CreditBalance): string {
  if (balance.allowance === null) return 'Unlimited';
  return `${Math.max(0, balance.allowance - balance.used)} / ${balance.allowance} remaining`;
}
