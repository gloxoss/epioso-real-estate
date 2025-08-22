'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, BarChart3, Building2, CreditCard, Wrench, FileText, Users } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface ScreenshotsSectionProps {
  dictionary: any
  locale: Locale
}

export function ScreenshotsSection({ dictionary, locale }: ScreenshotsSectionProps) {
  const [activeTab, setActiveTab] = useState(0)

  const screenshots = [
    {
      id: 'dashboard',
      title: 'Analytics Dashboard',
      description: 'Comprehensive overview of your property portfolio with real-time KPIs, revenue tracking, and performance metrics.',
      icon: BarChart3,
      image: '/screenshots/dashboard.png',
      features: ['Real-time KPIs', 'Revenue Analytics', 'Performance Metrics', 'Custom Reports']
    },
    {
      id: 'properties',
      title: 'Property Management',
      description: 'Manage your entire property portfolio with detailed property profiles, unit tracking, and occupancy management.',
      icon: Building2,
      image: '/screenshots/properties.png',
      features: ['Property Profiles', 'Unit Management', 'Occupancy Tracking', 'Maintenance History']
    },
    {
      id: 'billing',
      title: 'Billing & Collections',
      description: 'Automated rent collection, invoice generation, and payment tracking with multiple payment methods support.',
      icon: CreditCard,
      image: '/screenshots/billing.png',
      features: ['Automated Billing', 'Payment Tracking', 'Invoice Generation', 'Financial Reports']
    },
    {
      id: 'maintenance',
      title: 'Maintenance Management',
      description: 'Track maintenance requests, schedule repairs, manage vendors, and maintain detailed work order history.',
      icon: Wrench,
      image: '/screenshots/maintenance.png',
      features: ['Work Orders', 'Vendor Management', 'Scheduling', 'Cost Tracking']
    },
    {
      id: 'documents',
      title: 'Document Management',
      description: 'Secure document storage for leases, contracts, and important property documents with version control.',
      icon: FileText,
      image: '/screenshots/documents.png',
      features: ['Secure Storage', 'Version Control', 'Document Sharing', 'Digital Signatures']
    },
    {
      id: 'tenants',
      title: 'Tenant Portal',
      description: 'Self-service tenant portal for rent payments, maintenance requests, and communication with property managers.',
      icon: Users,
      image: '/screenshots/tenants.png',
      features: ['Online Payments', 'Maintenance Requests', 'Communication', 'Lease Information']
    }
  ]

  const nextTab = () => {
    setActiveTab((prev) => (prev + 1) % screenshots.length)
  }

  const prevTab = () => {
    setActiveTab((prev) => (prev - 1 + screenshots.length) % screenshots.length)
  }

  return (
    <section id="screenshots" className="py-24 bg-slate-50 dark:bg-slate-800/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            See Epiosio in Action
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Explore our intuitive interface designed specifically for real estate professionals. 
            Every feature is crafted to make property management effortless.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {screenshots.map((screenshot, index) => (
            <button
              key={screenshot.id}
              onClick={() => setActiveTab(index)}
              className={`flex items-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                activeTab === index
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              <screenshot.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{screenshot.title}</span>
            </button>
          ))}
        </div>

        {/* Screenshot Display */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Screenshot Image */}
            <div className="relative order-2 lg:order-1">
              <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Browser Header */}
                <div className="bg-slate-100 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex items-center space-x-2">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    </div>
                    <div className="flex-1 bg-white dark:bg-slate-700 rounded px-3 py-1 text-xs text-slate-500 dark:text-slate-400">
                      epiosio.com/{screenshots[activeTab].id}
                    </div>
                  </div>
                </div>

                {/* Mock Screenshot Content */}
                <div className="aspect-video bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  <div className="text-center">
                    {(() => {
                      const IconComponent = screenshots[activeTab].icon
                      return <IconComponent className="h-16 w-16 text-slate-400 dark:text-slate-600 mx-auto mb-4" />
                    })()}
                    <p className="text-slate-500 dark:text-slate-400 text-sm">
                      {screenshots[activeTab].title} Interface
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Arrows */}
              <button
                onClick={prevTab}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              <button
                onClick={nextTab}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white dark:bg-slate-800 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>

            {/* Content */}
            <div className="order-1 lg:order-2">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-6">
                {(() => {
                  const IconComponent = screenshots[activeTab].icon
                  return <IconComponent className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                })()}
              </div>

              <h3 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                {screenshots[activeTab].title}
              </h3>

              <p className="text-lg text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
                {screenshots[activeTab].description}
              </p>

              <div className="space-y-3 mb-8">
                {screenshots[activeTab].features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                    <span className="text-slate-700 dark:text-slate-300">{feature}</span>
                  </div>
                ))}
              </div>

              <div className="flex space-x-4">
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                  Try This Feature
                </button>
                <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-lg transition-colors duration-200">
                  Learn More
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center space-x-2 mt-8">
          {screenshots.map((_, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                activeTab === index
                  ? 'bg-blue-600 scale-125'
                  : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
