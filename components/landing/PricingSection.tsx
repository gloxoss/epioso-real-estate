'use client'

import { useState } from 'react'
import { Check, X, Star, Zap, Shield } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface PricingSectionProps {
  dictionary: any
  locale: Locale
}

export function PricingSection({ dictionary, locale }: PricingSectionProps) {
  const [isAnnual, setIsAnnual] = useState(true)

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for individual landlords',
      monthlyPrice: 299,
      annualPrice: 2990,
      currency: 'MAD',
      popular: false,
      features: [
        'Up to 5 properties',
        'Basic dashboard & analytics',
        'Tenant management',
        'Rent collection',
        'Maintenance tracking',
        'Document storage (5GB)',
        'Email support',
        'Mobile app access'
      ],
      limitations: [
        'Advanced reporting',
        'API access',
        'White-label options',
        'Priority support'
      ]
    },
    {
      name: 'Professional',
      description: 'Ideal for property managers',
      monthlyPrice: 599,
      annualPrice: 5990,
      currency: 'MAD',
      popular: true,
      features: [
        'Up to 25 properties',
        'Advanced dashboard & analytics',
        'Tenant portal',
        'Automated billing',
        'Maintenance management',
        'Document storage (50GB)',
        'Financial reporting',
        'Priority email support',
        'Mobile app access',
        'Multi-user access (3 users)',
        'Custom branding'
      ],
      limitations: [
        'API access',
        'White-label options'
      ]
    },
    {
      name: 'Enterprise',
      description: 'For large property management companies',
      monthlyPrice: 1299,
      annualPrice: 12990,
      currency: 'MAD',
      popular: false,
      features: [
        'Unlimited properties',
        'Full dashboard & analytics',
        'Advanced tenant portal',
        'Automated billing & collections',
        'Complete maintenance suite',
        'Unlimited document storage',
        'Advanced reporting & insights',
        'Priority phone & email support',
        'Mobile app access',
        'Unlimited users',
        'White-label options',
        'API access',
        'Custom integrations',
        'Dedicated account manager'
      ],
      limitations: []
    }
  ]

  const getPrice = (plan: typeof plans[0]) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice
  }

  const getSavings = (plan: typeof plans[0]) => {
    const monthlyCost = plan.monthlyPrice * 12
    const annualCost = plan.annualPrice
    const savings = monthlyCost - annualCost
    const percentage = Math.round((savings / monthlyCost) * 100)
    return { amount: savings, percentage }
  }

  return (
    <section id="pricing" className="py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your property management needs. 
            All plans include our core features with no hidden fees.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white dark:bg-slate-900 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setIsAnnual(false)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                !isAnnual
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setIsAnnual(true)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 relative ${
                isAnnual
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Annual
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <div
              key={plan.name}
              className={`relative bg-white dark:bg-slate-900 rounded-2xl shadow-lg border-2 transition-all duration-200 hover:shadow-xl ${
                plan.popular
                  ? 'border-blue-500 scale-105'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              {/* Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium flex items-center space-x-1">
                    <Star className="h-4 w-4 fill-current" />
                    <span>Most Popular</span>
                  </div>
                </div>
              )}

              <div className="p-8">
                {/* Plan Header */}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 dark:text-slate-400 mb-6">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-slate-900 dark:text-white">
                        {getPrice(plan).toLocaleString()}
                      </span>
                      <span className="text-slate-600 dark:text-slate-400 ml-2">
                        {plan.currency}
                      </span>
                      <span className="text-slate-500 dark:text-slate-500 ml-1">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-sm text-green-600 dark:text-green-400 mt-1">
                        Save {getSavings(plan).amount.toLocaleString()} MAD ({getSavings(plan).percentage}%)
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <button
                    className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-200 ${
                      plan.popular
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl'
                        : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-white'
                    }`}
                  >
                    {plan.popular ? (
                      <span className="flex items-center justify-center space-x-2">
                        <Zap className="h-4 w-4" />
                        <span>Start Free Trial</span>
                      </span>
                    ) : (
                      'Get Started'
                    )}
                  </button>
                </div>

                {/* Features */}
                <div className="space-y-4">
                  <h4 className="font-semibold text-slate-900 dark:text-white">
                    What's included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-start space-x-3">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-600 dark:text-slate-400 text-sm">
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation, limitationIndex) => (
                      <li key={limitationIndex} className="flex items-start space-x-3 opacity-50">
                        <X className="h-5 w-5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-slate-500 dark:text-slate-500 text-sm line-through">
                          {limitation}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div className="text-center mt-16">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-700">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              For large enterprises or unique requirements, we offer custom pricing and features. 
              Contact our sales team to discuss your specific needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                Contact Sales
              </button>
              <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-lg transition-colors duration-200">
                Schedule Demo
              </button>
            </div>
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center space-x-2 text-slate-600 dark:text-slate-400">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="text-sm">30-day money-back guarantee • No setup fees • Cancel anytime</span>
          </div>
        </div>
      </div>
    </section>
  )
}
