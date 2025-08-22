'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Play, Building2, Users, TrendingUp } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface HeroSectionProps {
  dictionary: any
  locale: Locale
}

export function HeroSection({ dictionary, locale }: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:bg-grid-slate-700/25 dark:[mask-image:linear-gradient(0deg,rgba(255,255,255,0.1),rgba(255,255,255,0.5))]" />
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4 mr-2" />
              Modern Real Estate Management
            </div>

            {/* Headline */}
            <h1 className="text-4xl lg:text-6xl font-bold text-slate-900 dark:text-white mb-6 leading-tight">
              Manage Your{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                Real Estate
              </span>{' '}
              Portfolio with Ease
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-slate-600 dark:text-slate-400 mb-8 leading-relaxed">
              Streamline property management, track finances, manage tenants, and grow your real estate business with our comprehensive platform designed for modern property managers.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-12">
              <Button size="lg" asChild className="text-lg px-8 py-4">
                <Link href="/signup" className="flex items-center">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 py-4 flex items-center">
                <Play className="mr-2 h-5 w-5" />
                Watch Demo
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center">
                <div className="flex -space-x-2 mr-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-green-500 border-2 border-white dark:border-slate-900"></div>
                  <div className="w-8 h-8 rounded-full bg-purple-500 border-2 border-white dark:border-slate-900"></div>
                </div>
                <span>Trusted by 500+ property managers</span>
              </div>
              <div className="flex items-center">
                <span className="text-yellow-500 mr-1">★★★★★</span>
                <span>4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Hero Image/Dashboard Preview */}
          <div className="relative">
            <div className="relative bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
              {/* Mock Dashboard Header */}
              <div className="bg-slate-50 dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="h-6 w-6 rounded bg-blue-600"></div>
                    <span className="font-semibold text-slate-900 dark:text-white">Dashboard</span>
                  </div>
                  <div className="flex space-x-2">
                    <div className="h-2 w-2 rounded-full bg-red-500"></div>
                    <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                  </div>
                </div>
              </div>

              {/* Mock Dashboard Content */}
              <div className="p-6">
                {/* KPI Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">$125K</p>
                      </div>
                      <Building2 className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-400">Properties</p>
                        <p className="text-2xl font-bold text-slate-900 dark:text-white">24</p>
                      </div>
                      <Users className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                </div>

                {/* Mock Chart */}
                <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 mb-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
                    <span className="text-sm text-green-600">+12%</span>
                  </div>
                  <div className="h-20 bg-gradient-to-r from-blue-500 to-indigo-500 rounded opacity-20"></div>
                </div>

                {/* Mock List */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-sm text-slate-900 dark:text-white">Sunset Apartments</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">$4,200</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-sm text-slate-900 dark:text-white">Downtown Plaza</span>
                    </div>
                    <span className="text-sm text-slate-600 dark:text-slate-400">$3,800</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Elements */}
            <div className="absolute -top-4 -right-4 bg-white dark:bg-slate-800 rounded-lg shadow-lg p-3 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-slate-600 dark:text-slate-400">Live Updates</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
