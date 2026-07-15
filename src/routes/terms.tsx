import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/terms')({ component: Terms });

function Terms() {
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Legal</p>
    <h1 className="mt-2 text-4xl font-bold">Terms of Use</h1>
    <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
      <section><h2 className="text-lg font-semibold text-foreground">Digital products</h2><p>Blank templates and historical charts are digital products licensed for the purchaser's personal use. Purchased products remain available to the purchasing account while the service operates and the account remains in good standing.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Printing and exports</h2><p>Customers are responsible for checking print size, crop, bleed and image quality before export. The editor provides estimated DPI guidance, but final output can vary by printer, paper and uploaded image quality.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Subscriptions</h2><p>Subscriptions renew until cancelled through the Stripe customer portal. Monthly allowances reset according to the active billing period and do not carry over unless stated otherwise.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Acceptable use</h2><p>Do not upload unlawful, infringing or harmful material. You must own or have permission to use uploaded logos, photographs and backgrounds.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Beta service</h2><p>During beta testing, features may change and occasional interruptions may occur. Report issues before relying on the platform for time-critical professional printing.</p></section>
    </div>
  </main>;
}
