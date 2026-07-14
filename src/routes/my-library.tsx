import { createFileRoute, Link } from '@tanstack/react-router';
import { useQuery } from '@tanstack/react-query';
import { db } from '@/integrations/neon/client';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Library, Crown, FileText, Loader2 } from 'lucide-react';
import { productById } from '@/lib/commerce/products';

export const Route = createFileRoute('/my-library')({ component: MyLibrary });

type Purchase = { id: string; product_key: string; resource_id: string | null; status: string; created_at: string };
type Subscription = { id: string; product_key: string; status: string; current_period_end: string | null; cancel_at_period_end: boolean };

function MyLibrary() {
  const { user, loading } = useAuth();
  const purchases = useQuery({ queryKey: ['library-purchases', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await db.from<Purchase[]>('commerce_purchases').select('id,product_key,resource_id,status,created_at').eq('status', 'active').order('created_at', { ascending: false });
    if (error) throw new Error(error.message); return data || [];
  }});
  const subscriptions = useQuery({ queryKey: ['library-subscriptions', user?.id], enabled: !!user, queryFn: async () => {
    const { data, error } = await db.from<Subscription[]>('commerce_subscriptions').select('id,product_key,status,current_period_end,cancel_at_period_end').order('created_at', { ascending: false });
    if (error) throw new Error(error.message); return data || [];
  }});

  if (loading) return <main className="grid min-h-[50vh] place-items-center"><Loader2 className="h-8 w-8 animate-spin text-gold" /></main>;
  if (!user) return <main className="mx-auto max-w-2xl px-6 py-20 text-center"><Library className="mx-auto h-14 w-14 text-gold" /><h1 className="mt-4 text-3xl font-bold">My Library</h1><p className="mt-2 text-muted-foreground">Sign in to view templates, historical charts and memberships you own.</p><Link to="/login" search={{ returnTo: '/my-library' } as any}><Button className="mt-6 bg-gold text-navy">Sign in</Button></Link></main>;

  const activeSubs = (subscriptions.data || []).filter((s) => ['active','trialing'].includes(s.status));
  return <main className="mx-auto max-w-6xl px-6 py-12"><div className="mb-8"><h1 className="text-3xl font-bold">My Library</h1><p className="mt-2 text-muted-foreground">Your permanent purchases and active memberships.</p></div>
    {activeSubs.length > 0 && <section className="mb-10"><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><Crown className="h-5 w-5 text-gold" /> Membership</h2><div className="grid gap-4 md:grid-cols-2">{activeSubs.map((sub) => <Card key={sub.id} className="glass-panel border-gold/20"><CardContent className="p-5"><p className="font-semibold">{productById(sub.product_key).name}</p><p className="mt-1 text-sm text-emerald-400">{sub.status}</p>{sub.current_period_end && <p className="mt-2 text-xs text-muted-foreground">Current period ends {new Date(sub.current_period_end).toLocaleDateString()}</p>}</CardContent></Card>)}</div></section>}
    <section><h2 className="mb-4 flex items-center gap-2 text-xl font-semibold"><FileText className="h-5 w-5 text-gold" /> Owned products</h2>{purchases.isLoading ? <Loader2 className="h-6 w-6 animate-spin text-gold" /> : purchases.data?.length ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{purchases.data.map((purchase) => { const product = productById(purchase.product_key); return <Card key={purchase.id} className="glass-panel border-gold/10"><CardContent className="p-5"><p className="font-semibold">{product.name}</p><p className="mt-1 text-sm text-muted-foreground">{purchase.resource_id ? `Resource: ${purchase.resource_id}` : product.description}</p><p className="mt-3 text-xs text-emerald-400">Owned permanently</p><Link to="/workshop"><Button size="sm" className="mt-4 bg-gold text-navy">Use in Workshop</Button></Link></CardContent></Card>; })}</div> : <Card className="glass-panel border-gold/10"><CardContent className="p-8 text-center text-muted-foreground">No purchases yet. <Link to="/pricing" className="text-gold">Browse the shop</Link>.</CardContent></Card>}</section>
  </main>;
}
