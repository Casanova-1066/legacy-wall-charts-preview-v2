import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/privacy')({ component: Privacy });

function Privacy() {
  return <main className="mx-auto max-w-4xl px-6 py-12">
    <p className="text-xs uppercase tracking-[0.25em] text-gold/70">Legal</p>
    <h1 className="mt-2 text-4xl font-bold">Privacy Policy</h1>
    <div className="mt-8 space-y-6 text-sm leading-7 text-muted-foreground">
      <section><h2 className="text-lg font-semibold text-foreground">Information collected</h2><p>We process account details, project data, purchase records and technical diagnostics required to operate Legacy Wall Charts.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Payments</h2><p>Payments are processed by Stripe. Card details are not stored by Legacy Wall Charts. Stripe provides payment status, customer identifiers and billing records needed to grant access.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Project storage</h2><p>Guest drafts are stored on the current device. Signed-in projects may be stored in Neon so they can be accessed across devices.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Uploaded images</h2><p>Uploaded backgrounds may be stored with projects. Do not upload confidential material or images you do not have permission to use.</p></section>
      <section><h2 className="text-lg font-semibold text-foreground">Your choices</h2><p>You may request access, correction or deletion of account data. Subscription and invoice controls are available through the Stripe customer portal.</p></section>
    </div>
  </main>;
}
