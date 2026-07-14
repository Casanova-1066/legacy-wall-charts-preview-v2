import { createFileRoute, Link, useSearch } from '@tanstack/react-router';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { XCircle } from 'lucide-react';

export const Route = createFileRoute('/checkout/cancelled')({ component: CheckoutCancelled });
function CheckoutCancelled() {
  const search = useSearch({ strict: false }) as { product?: string };
  return <main className="mx-auto max-w-xl px-6 py-20"><Card className="glass-panel border-gold/10"><CardContent className="p-8 text-center">
    <XCircle className="mx-auto h-14 w-14 text-muted-foreground" /><h1 className="mt-4 text-2xl font-bold">Checkout cancelled</h1><p className="mt-2 text-muted-foreground">Nothing was charged. You can return whenever you are ready.</p>
    <div className="mt-6 flex justify-center gap-3"><Link to="/checkout" search={{ product: search.product || 'blank-template' } as any}><Button className="bg-gold text-navy">Try again</Button></Link><Link to="/pricing"><Button variant="outline">View pricing</Button></Link></div>
  </CardContent></Card></main>;
}
