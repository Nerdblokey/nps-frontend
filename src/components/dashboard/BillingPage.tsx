'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';

interface PricingPlan {
  id: string;
  name: string;
  price: number;
  interval: string;
  features: string[];
  recommended?: boolean;
}

const pricingPlans: PricingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 0,
    interval: 'month',
    features: [
      'Up to 100 responses/month',
      '3 active surveys',
      'Basic analytics',
      'Email support'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 29,
    interval: 'month',
    features: [
      'Up to 1,000 responses/month',
      'Unlimited surveys',
      'Advanced analytics',
      'Slack integration',
      'HubSpot integration',
      'Priority support',
      'Custom branding'
    ],
    recommended: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 99,
    interval: 'month',
    features: [
      'Unlimited responses',
      'Unlimited surveys',
      'Advanced analytics',
      'All integrations',
      'White-label solution',
      'Dedicated support',
      'Custom features',
      'SLA guarantee'
    ]
  }
];

const BillingPage: React.FC = () => {
  const [currentPlan, setCurrentPlan] = useState<string>('starter');
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    if (planId === 'starter') {
      // Free plan - no payment needed
      return;
    }

    setLoading(planId);

    try {
      // In a real app, you'd get the Stripe price ID from your backend
      const priceId = planId === 'professional' ? 'price_professional' : 'price_enterprise';
      
      const response = await fetch('/api/subscriptions/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ priceId })
      });

      if (response.ok) {
        const { sessionId } = await response.json();
        
        // Redirect to Stripe Checkout
        const stripe = (window as any).Stripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
        await stripe.redirectToCheckout({ sessionId });
      } else {
        console.error('Failed to create checkout session');
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Choose Your Plan</h1>
        <p className="text-gray-600 text-lg">
          Select the perfect plan for your NPS survey needs
        </p>
      </div>

      {/* Current Plan Status */}
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-lg font-medium text-gray-900 capitalize">{currentPlan}</p>
              <p className="text-gray-600">
                {currentPlan === 'starter' ? 'Free forever' : `$${pricingPlans.find(p => p.id === currentPlan)?.price}/month`}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Usage this month</p>
              <p className="text-2xl font-bold text-gray-900">0 / 100</p>
              <p className="text-xs text-gray-500">responses</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <div className="grid gap-6 lg:grid-cols-3">
        {pricingPlans.map((plan) => (
          <Card key={plan.id} className={plan.recommended ? 'ring-2 ring-blue-500' : ''}>
            {plan.recommended && (
              <div className="bg-blue-500 text-white text-center py-1 text-sm font-medium rounded-t-lg">
                Recommended
              </div>
            )}
            <CardHeader>
              <div className="text-center">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <div className="mt-2">
                  <span className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                  </span>
                  <span className="text-gray-600">/{plan.interval}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3 mb-6">
                {plan.features.map((feature, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={() => handleSubscribe(plan.id)}
                loading={loading === plan.id}
                className="w-full"
                variant={currentPlan === plan.id ? 'secondary' : 'primary'}
                disabled={currentPlan === plan.id}
              >
                {currentPlan === plan.id 
                  ? 'Current Plan' 
                  : plan.price === 0 
                    ? 'Get Started' 
                    : 'Upgrade Now'
                }
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Features Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4">Feature</th>
                  <th className="text-center py-3 px-4">Starter</th>
                  <th className="text-center py-3 px-4">Professional</th>
                  <th className="text-center py-3 px-4">Enterprise</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr>
                  <td className="py-3 px-4 font-medium">Monthly Responses</td>
                  <td className="py-3 px-4 text-center">100</td>
                  <td className="py-3 px-4 text-center">1,000</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Active Surveys</td>
                  <td className="py-3 px-4 text-center">3</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                  <td className="py-3 px-4 text-center">Unlimited</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Integrations</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Custom Branding</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">✓</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">White-label</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">-</td>
                  <td className="py-3 px-4 text-center">✓</td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-medium">Support</td>
                  <td className="py-3 px-4 text-center">Email</td>
                  <td className="py-3 px-4 text-center">Priority</td>
                  <td className="py-3 px-4 text-center">Dedicated</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card>
        <CardHeader>
          <CardTitle>Frequently Asked Questions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Can I change plans anytime?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">What happens if I exceed my response limit?</h4>
              <p className="text-gray-600 text-sm">
                You'll receive notifications as you approach your limit. You can upgrade your plan or additional responses will be paused until the next billing cycle.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Is there a free trial?</h4>
              <p className="text-gray-600 text-sm">
                Our Starter plan is free forever with 100 responses per month. You can upgrade anytime for more features.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-1">How secure is my data?</h4>
              <p className="text-gray-600 text-sm">
                We use enterprise-grade security with encrypted data storage, regular backups, and SOC 2 compliance.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BillingPage;