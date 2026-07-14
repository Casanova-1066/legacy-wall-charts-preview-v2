# Legacy Wall Charts — Release Candidate 1

This build introduces the first real server-side commerce path for beta testing.

## Included
- Stripe Checkout Sessions created by Vercel Functions.
- Signed Stripe webhook fulfilment.
- Permanent purchases and subscriptions stored in Neon.
- Stripe Customer Portal endpoint.
- Verified checkout success/pending page.
- My Library for owned products and active memberships.
- Refund state updates.
- Idempotent webhook event storage.

## Required before deployment
1. Run `neon/migrations/0009_rc1_commerce.sql`.
2. Add every variable from `.env.example` to Vercel.
3. Use Stripe test keys and test-mode Price IDs for beta.
4. Deploy once so `/api/stripe/webhook` exists.
5. Add the deployed webhook URL in Stripe Event Destinations.
6. Add the resulting `whsec_...` as `STRIPE_WEBHOOK_SECRET` in Vercel and redeploy.

## Stripe events
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `charge.refunded`

## Test checklist
- Sign in.
- Buy the £3.99 test product with Stripe test card `4242 4242 4242 4242`.
- Confirm checkout returns to `/checkout/success`.
- Confirm My Library shows the product.
- Confirm the purchase row exists in `commerce_purchases`.
- Open the Customer Portal from Account.
