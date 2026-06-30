'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, CreditCard, Mail } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface Plan {
  _id: string;
  name: string;
  key: string;
  maxProjects: number;
  monthlyPrice: number;
  annualPrice: number;
  features: string[];
}

export default function SubscriptionPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await apiClient.get<Plan[]>('/plans');
      setPlans(data || []);
    } catch (err) {
      console.error('Failed to fetch plans', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-8 p-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-indigo-500">
          Upgrade Your DevLock Experience
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Choose a plan that scales with your projects. Simple pricing, powerful features, and professional support.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 pt-8">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`relative flex flex-col overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                plan.monthlyPrice > 0 ? 'border-primary/50 shadow-primary/10' : 'border-border'
              }`}
            >
              {plan.monthlyPrice > 0 && (
                <div className="absolute top-0 right-0 rounded-bl-xl bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Popular
                </div>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold uppercase tracking-wider">{plan.name}</CardTitle>
                <div className="mt-4 flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-extrabold">${plan.monthlyPrice}</span>
                  <span className="text-sm font-medium text-muted-foreground">/mo</span>
                </div>
                <CardDescription className="mt-2 text-sm text-muted-foreground font-medium">
                  Up to {plan.maxProjects} Projects
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-3">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                      <span className="text-sm text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full font-semibold ${
                    plan.monthlyPrice > 0 ? 'bg-primary hover:bg-primary/90' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                  size="lg"
                  onClick={() => setSelectedPlan(plan)}
                >
                  {plan.monthlyPrice > 0 ? 'Upgrade Now' : 'Current Plan'}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!selectedPlan} onOpenChange={(open) => !open && setSelectedPlan(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl text-center">Complete Your Payment</DialogTitle>
            <DialogDescription className="text-center">
              You selected the <strong className="text-foreground">{selectedPlan?.name}</strong> plan (${selectedPlan?.monthlyPrice}/mo).
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-pink-500" />
                Bkash / Nagad
              </h3>
              <p className="text-sm text-muted-foreground">
                Send <strong>${selectedPlan?.monthlyPrice}</strong> (equivalent BDT) via Send Money to:
              </p>
              <div className="rounded-md bg-muted p-3 text-center text-xl font-mono tracking-wider font-bold text-primary">
                01735677090
              </div>
            </div>

            <div className="rounded-lg border bg-card p-4 space-y-3 shadow-sm">
              <h3 className="font-semibold flex items-center gap-2">
                <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">₿</div>
                Crypto Payment (USDT/TRC20)
              </h3>
              <p className="text-sm text-muted-foreground">
                Send exactly <strong>{selectedPlan?.monthlyPrice} USDT</strong> to the following address:
              </p>
              <div className="rounded-md bg-muted p-3 text-center text-sm font-mono break-all text-primary">
                [Your Crypto Wallet Address Here]
              </div>
            </div>

            <div className="rounded-lg border bg-primary/10 border-primary/20 p-4 space-y-3">
              <h3 className="font-semibold flex items-center gap-2 text-primary">
                <Mail className="h-5 w-5" />
                Activate Your Plan
              </h3>
              <p className="text-sm text-muted-foreground">
                After making the payment, please email us with your <strong>Transaction ID</strong> and <strong>Account Email</strong> to get your plan activated instantly.
              </p>
              <a href="mailto:hello@tashanto.com" className="block w-full">
                <Button className="w-full font-bold" variant="default">
                  Contact hello@tashanto.com
                </Button>
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
