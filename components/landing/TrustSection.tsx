'use client'

import { Building2, Users, DollarSign, TrendingUp } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface TrustSectionProps {
  dictionary: any
  locale: Locale
}

export function TrustSection({ dictionary, locale }: TrustSectionProps) {
  const stats = [
    {
      icon: Building2,
      value: '10K+',
      label: 'Properties Managed',
      description: 'Across residential and commercial sectors'
    },
    {
      icon: Users,
      value: '500+',
      label: 'Property Managers',
      description: 'Trust our platform daily'
    },
    {
      icon: DollarSign,
      value: '$50M+',
      label: 'Revenue Tracked',
      description: 'In rental income and sales'
    },
    {
      icon: TrendingUp,
      value: '99.9%',
      label: 'Uptime',
      description: 'Reliable service you can count on'
    }
  ]

  const companies = [
    { name: 'Immobilier Maroc', logo: '/logos/company1.svg' },
    { name: 'Atlas Properties', logo: '/logos/company2.svg' },
    { name: 'Casablanca Real Estate', logo: '/logos/company3.svg' },
    { name: 'Rabat Holdings', logo: '/logos/company4.svg' },
    { name: 'Marrakech Invest', logo: '/logos/company5.svg' },
  ]

  return (
    <section className="py-16 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Trust Logos */}
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-8">
            Trusted by leading real estate companies across Morocco
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
            {companies.map((company, index) => (
              <div
                key={company.name}
                className="flex items-center justify-center h-12 w-32 bg-slate-100 dark:bg-slate-800 rounded-lg"
              >
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {company.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="text-center group hover:scale-105 transition-transform duration-200"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-4 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors duration-200">
                <stat.icon className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
                {stat.value}
              </div>
              <div className="text-lg font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {stat.label}
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                {stat.description}
              </div>
            </div>
          ))}
        </div>

        {/* Social Proof */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center space-x-4 bg-slate-50 dark:bg-slate-800 rounded-2xl px-8 py-4">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 border-2 border-white dark:border-slate-800 flex items-center justify-center text-white text-sm font-medium"
                >
                  {String.fromCharCode(64 + i)}
                </div>
              ))}
            </div>
            <div className="text-left">
              <div className="flex items-center space-x-1 mb-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-yellow-400 text-lg">★</span>
                ))}
                <span className="text-sm font-medium text-slate-900 dark:text-white ml-2">
                  4.9/5
                </span>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Based on 200+ reviews from property managers
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
