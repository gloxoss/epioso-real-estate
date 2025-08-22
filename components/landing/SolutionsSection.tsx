'use client'

import { Building, Users, TrendingUp, Shield } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface SolutionsSectionProps {
  dictionary: any
  locale: Locale
}

export function SolutionsSection({ dictionary, locale }: SolutionsSectionProps) {
  const solutions = [
    {
      icon: Building,
      title: 'Property Managers',
      description: 'Streamline operations for residential and commercial properties',
      features: [
        'Multi-property dashboard',
        'Automated rent collection',
        'Maintenance scheduling',
        'Tenant communication portal',
        'Financial reporting'
      ],
      color: 'blue'
    },
    {
      icon: Users,
      title: 'Real Estate Investors',
      description: 'Maximize ROI and track portfolio performance',
      features: [
        'Investment analytics',
        'Cash flow tracking',
        'Market analysis tools',
        'Property valuation',
        'Tax reporting'
      ],
      color: 'green'
    },
    {
      icon: TrendingUp,
      title: 'Property Management Companies',
      description: 'Scale your business with enterprise-grade tools',
      features: [
        'Multi-client management',
        'Team collaboration',
        'White-label options',
        'API integrations',
        'Advanced reporting'
      ],
      color: 'purple'
    },
    {
      icon: Shield,
      title: 'Individual Landlords',
      description: 'Simple tools for small-scale property management',
      features: [
        'Easy tenant screening',
        'Lease management',
        'Payment tracking',
        'Maintenance requests',
        'Document storage'
      ],
      color: 'orange'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: {
        bg: 'bg-blue-50 dark:bg-blue-900/10',
        icon: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
        border: 'border-blue-200 dark:border-blue-800',
        hover: 'hover:border-blue-300 dark:hover:border-blue-700'
      },
      green: {
        bg: 'bg-green-50 dark:bg-green-900/10',
        icon: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
        border: 'border-green-200 dark:border-green-800',
        hover: 'hover:border-green-300 dark:hover:border-green-700'
      },
      purple: {
        bg: 'bg-purple-50 dark:bg-purple-900/10',
        icon: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
        border: 'border-purple-200 dark:border-purple-800',
        hover: 'hover:border-purple-300 dark:hover:border-purple-700'
      },
      orange: {
        bg: 'bg-orange-50 dark:bg-orange-900/10',
        icon: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
        border: 'border-orange-200 dark:border-orange-800',
        hover: 'hover:border-orange-300 dark:hover:border-orange-700'
      }
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section id="solutions" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Solutions for Every Real Estate Professional
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Whether you manage a single property or a large portfolio, we have the right tools 
            and features to help you succeed in the Moroccan real estate market.
          </p>
        </div>

        {/* Solutions Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {solutions.map((solution, index) => {
            const colors = getColorClasses(solution.color)
            return (
              <div
                key={index}
                className={`${colors.bg} rounded-2xl p-8 border-2 ${colors.border} ${colors.hover} transition-all duration-200 group`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-16 h-16 rounded-2xl ${colors.icon} flex items-center justify-center group-hover:scale-110 transition-transform duration-200`}>
                    <solution.icon className="h-8 w-8" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
                      {solution.title}
                    </h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-6">
                      {solution.description}
                    </p>
                    
                    <ul className="space-y-3">
                      {solution.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className="flex items-center text-slate-700 dark:text-slate-300">
                          <div className="w-2 h-2 rounded-full bg-current mr-3 opacity-60"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Use Cases */}
        <div className="mt-20">
          <div className="text-center mb-12">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Trusted Across Morocco
            </h3>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              From Casablanca to Marrakech, property professionals choose Epiosio
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">🏢</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Commercial Properties
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Office buildings, retail spaces, and commercial complexes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">🏠</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Residential Properties
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Apartments, villas, and residential developments
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">🏗️</span>
              </div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Mixed-Use Developments
              </h4>
              <p className="text-slate-600 dark:text-slate-400">
                Complex projects with multiple property types
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
