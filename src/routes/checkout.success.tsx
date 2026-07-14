import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { checkoutStatus } from '@/lib/commerce/api';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle2, Loader2, RefreshCw } from 'lucide-react';

export const Route = createFileRoute('/checkout/success')({ component: CheckoutSuccess });

function CheckoutSuccess() {
  const search = useSearch({ strict: false }) as { session_id?: string };
  const query = useQuery({
    queryKey: ['checkout-status', search.session_id],
    queryFn: () => checkoutStatus(search.session_id || ''),
    enabled: !!search.session_id,
    refetchInterval: (q) => q.state.data?.fulfilled ? false : 2000,
    retry: 3,
  });

  return <main className="mx-auto max-w-xl px-6 py-20"><Card className="glass-panel border-gold/10"><CardContent className="p-8 text-center">
    {query.data?.fulfilled ? <>
      <CheckCircle2 className="mx-auto h-14 w-14 text-emerald-400" />
      <h1 className="mt-4 text-2xl font-bold">Purchase confirmed</h1>
      <p className="mt-2 text-muted-foreground">Your ownership has been added to My Library.</p>
      <div className="mt-6 flex justify-center gap-3"><Link to="/my-library"><Button className="bg-gold text-navy">Open My Library</Button></Link><Link to="/workshop"><Button variant="outline">Return to Workshop</Button></Link></div>
    </> : <>
      {query.isError ? <RefreshCw className="mx-auto h-12 w-12 text-gold" /> : <Loader2 className="mx-auto h-12 w-12 animate-spin text-gold" />}
      <h1 className="mt-4 text-2xl font-bold">{query.isError ? 'Payment received — verification pending' : 'Confirming your purchase'}</h1>
      <p className="mt-2 text-muted-foreground">Stripe has returned you to Legacy Wall Charts. We are waiting for the signed webhook to grant access.</p>
      <Button className="mt-6" variant="outline" onClick={() => query.refetch()}>Check again</Button>
    </>}
  </CardContent></Card></main>;
}
