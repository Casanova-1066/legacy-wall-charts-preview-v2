import Stripe from 'stripe';
import { neon } from '@neondatabase/serverless';
import { createRemoteJWKSet, jwtVerify } from 'jose';

export const stripe = new Stripe(required('STRIPE_SECRET_KEY'));
export const sql = neon(required('DATABASE_URL'));

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

export type AuthIdentity = { id: string; email?: string };

export async function requireIdentity(req: any): Promise<AuthIdentity> {
  const auth = String(req.headers?.authorization || '');
  const token = auth.startsWith('Bearer ') ? auth.slice(7) : '';
  if (!token) throw Object.assign(new Error('Sign in required.'), { statusCode: 401 });

  const base = required('NEON_AUTH_URL').replace(/\/$/, '');
  const jwks = createRemoteJWKSet(new URL(`${base}/.well-known/jwks.json`));
  const { payload } = await jwtVerify(token, jwks);
  const id = String(payload.sub || payload.user_id || '');
  if (!id) throw Object.assign(new Error('Invalid authentication token.'), { statusCode: 401 });
  return { id, email: typeof payload.email === 'string' ? payload.email : undefined };
}

export function siteUrl(req: any): string {
  const configured = process.env.PUBLIC_SITE_URL?.replace(/\/$/, '');
  if (configured) return configured;
  const proto = String(req.headers?.['x-forwarded-proto'] || 'https');
  const host = String(req.headers?.['x-forwarded-host'] || req.headers?.host || '');
  return `${proto}://${host}`;
}

export function priceForProduct(product: string): string {
  const names: Record<string, string> = {
    'blank-template': 'STRIPE_PRICE_BLANK_TEMPLATE',
    'historical-chart': 'STRIPE_PRICE_HISTORICAL_CHART',
    'pro-monthly': 'STRIPE_PRICE_PRO_MONTHLY',
    'pro-yearly': 'STRIPE_PRICE_PRO_YEARLY',
    lifetime: 'STRIPE_PRICE_LIFETIME',
  };
  const envName = names[product];
  if (!envName) throw Object.assign(new Error('Unknown product.'), { statusCode: 400 });
  return required(envName);
}

export function sendError(res: any, error: any) {
  console.error(error);
  const status = Number(error?.statusCode) || 500;
  res.status(status).json({ error: status === 500 ? 'The request could not be completed.' : String(error?.message || error) });
}

export async function readRawBody(req: any): Promise<Buffer> {
  if (Buffer.isBuffer(req.body)) return req.body;
  if (typeof req.body === 'string') return Buffer.from(req.body);
  const chunks: Buffer[] = [];
  for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  return Buffer.concat(chunks);
}
