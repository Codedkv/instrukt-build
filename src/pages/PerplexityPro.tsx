import { useState, useEffect, FormEvent } from 'react';
import { useUser } from '@/contexts/UserContext';
import { withAuth } from '@/lib/withAuth';
import { Layout } from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import type { PromoCode } from '@/types/database';

function PerplexityProPage() {
  const { user, profile } = useUser();
  const [promoCode, setPromoCode] = useState<PromoCode | null>(null);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadPromoCode();
  }, [user]);

  const loadPromoCode = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('promo_codes')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;

      setPromoCode(data as PromoCode);
      if (data?.perplexity_account_email) {
        setEmail(data.perplexity_account_email);
      }
    } catch (error) {
      console.error('Error loading promo code:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleActivate = async (e: FormEvent) => {
    e.preventDefault();
    if (!promoCode) return;

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('promo_codes')
        .update({
          status: 'activated',
          perplexity_account_email: email.trim(),
          activated_at: new Date().toISOString()
        })
        .eq('id', promoCode.id);

      if (error) throw error;

      await supabase
        .from('profiles')
        .update({
          has_perplexity_pro: true,
          perplexity_pro_expires_at: promoCode.expires_at
        })
        .eq('id', user!.id);

      toast.success('Промокод активирован успешно!');
      await loadPromoCode();
    } catch (error: any) {
      toast.error(error.message || 'Произошла ошибка');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[50vh] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">🎟️ Perplexity Pro</h1>

          {promoCode?.status === 'activated' ? (
            <Card className="border-success">
              <CardHeader>
                <CardTitle className="text-success flex items-center gap-2">
                  ✅ Промокод активирован!
                </CardTitle>
                <CardDescription>
                  Ваша Pro подписка активна
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-sm">
                  <span className="text-muted-foreground">Email:</span>{' '}
                  <span className="font-mono">{promoCode.perplexity_account_email}</span>
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Активирован:</span>{' '}
                  {promoCode.activated_at &&
                    new Date(promoCode.activated_at).toLocaleDateString('ru-RU')}
                </p>
                <p className="text-sm">
                  <span className="text-muted-foreground">Действует до:</span>{' '}
                  {new Date(promoCode.expires_at).toLocaleDateString('ru-RU')}
                </p>
              </CardContent>
            </Card>
          ) : promoCode ? (
            <Card>
              <CardHeader>
                <CardTitle>Активируйте промокод</CardTitle>
                <CardDescription>
                  Введите email для активации Perplexity Pro
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-primary/10 border border-primary p-4 rounded-lg mb-6">
                  <p className="text-sm text-muted-foreground mb-2">Ваш промокод:</p>
                  <p className="text-3xl font-bold font-mono text-primary text-center tracking-widest">
                    {promoCode.code}
                  </p>
                </div>

                <form onSubmit={handleActivate} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email для Perplexity Pro</Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      На этот email будет оформлена Pro подписка
                    </p>
                  </div>

                  <Button type="submit" disabled={submitting} className="w-full">
                    {submitting ? 'Активация...' : 'Активировать'}
                  </Button>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <CardTitle>Промокод не найден</CardTitle>
                <CardDescription>
                  Промокод будет создан автоматически при регистрации
                </CardDescription>
              </CardHeader>
            </Card>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default withAuth(PerplexityProPage);
