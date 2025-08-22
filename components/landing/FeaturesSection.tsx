'use client'

import { 
  BarChart3, 
  CreditCard, 
  Wrench, 
  FileText, 
  Bell, 
  Brain,
  Building2,
  Users,
  Calendar,
  Shield,
  Smartphone,
  Globe
} from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface FeaturesSectionProps {
  dictionary: any
  locale: Locale
}

export function FeaturesSection({ dictionary, locale }: FeaturesSectionProps) {
  const features = [
    {
      icon: BarChart3,
      title: 'Dashboard & Analytics',
      description: 'Comprehensive dashboard with real-time KPIs, revenue tracking, and performance analytics to make data-driven decisions.',
      color: 'blue'
    },
    {
      icon: CreditCard,
      title: 'Billing & Collections',
      description: 'Automated rent collection, invoice generation, payment tracking, and financial reporting with multiple payment methods.',
      color: 'green'
    },
    {
      icon: Wrench,
      title: 'Maintenance Management',
      description: 'Track maintenance requests, schedule repairs, manage vendors, and maintain property condition with ease.',
      color: 'orange'
    },
    {
      icon: FileText,
      title: 'Document Management',
      description: 'Secure document storage, lease agreements, contracts, and important property documents in one place.',
      color: 'purple'
    },
    {
      icon: Bell,
      title: 'Smart Alerts',
      description: 'Automated notifications for rent due dates, maintenance schedules, lease renewals, and important deadlines.',
      color: 'red'
    },
    {
      icon: Brain,
      title: 'AI-Powered Insights',
      description: 'Intelligent recommendations for pricing, tenant screening, market analysis, and business optimization.',
      color: 'indigo'
    },
    {
      icon: Building2,
      title: 'Property Portfolio',
      description: 'Manage multiple properties, units, and portfolios with detailed property profiles and performance tracking.',
      color: 'emerald'
    },
    {
      icon: Users,
      title: 'Tenant Management',
      description: 'Complete tenant profiles, lease tracking, communication history, and tenant portal for self-service.',
      color: 'cyan'
    },
    {
      icon: Calendar,
      title: 'Scheduling & Tasks',
      description: 'Integrated calendar for property visits, maintenance schedules, and task management with reminders.',
      color: 'pink'
    },
    {
      icon: Shield,
      title: 'Security & Compliance',
      description: 'Bank-level security, data encryption, compliance with local regulations, and regular security audits.',
      color: 'slate'
    },
    {
      icon: Smartphone,
      title: 'Mobile Access',
      description: 'Full-featured mobile app for iOS and Android to manage your properties on the go.',
      color: 'violet'
    },
    {
      icon: Globe,
      title: 'Multi-Language',
      description: 'Support for Arabic, French, and English with localized features for the Moroccan market.',
      color: 'amber'
    }
  ]

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
      green: 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400',
      orange: 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
      purple: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
      red: 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400',
      indigo: 'bg-indigo-100 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400',
      emerald: 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
      cyan: 'bg-cyan-100 dark:bg-cyan-900/20 text-cyan-600 dark:text-cyan-400',
      pink: 'bg-pink-100 dark:bg-pink-900/20 text-pink-600 dark:text-pink-400',
      slate: 'bg-slate-100 dark:bg-slate-700/20 text-slate-600 dark:text-slate-400',
      violet: 'bg-violet-100 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400',
      amber: 'bg-amber-100 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400',
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  return (
    <section id="features" className="py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Everything You Need to Manage Real Estate
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Comprehensive tools and features designed specifically for property managers, 
            real estate investors, and property management companies.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all duration-200 group"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-6 ${getColorClasses(feature.color)} group-hover:scale-110 transition-transform duration-200`}>
                <feature.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-3">
                {feature.title}
              </h3>
              
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Ready to streamline your property management?
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-lg transition-colors duration-200">
              Schedule Demo
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
