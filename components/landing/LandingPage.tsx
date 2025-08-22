'use client'

import { type Locale } from '@/lib/i18n/config'
import { LandingHeader } from './LandingHeader'
import { HeroSection } from './HeroSection'
import { TrustSection } from './TrustSection'
import { FeaturesSection } from './FeaturesSection'
import { SolutionsSection } from './SolutionsSection'
import { ScreenshotsSection } from './ScreenshotsSection'
import { TestimonialsSection } from './TestimonialsSection'
import { PricingSection } from './PricingSection'
import { FAQSection } from './FAQSection'
import { LandingFooter } from './LandingFooter'

interface LandingPageProps {
  dictionary: any
  locale: Locale
}

export default function LandingPage({ dictionary, locale }: LandingPageProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <LandingHeader dictionary={dictionary} locale={locale} />
      
      <main>
        <HeroSection dictionary={dictionary} locale={locale} />
        <TrustSection dictionary={dictionary} locale={locale} />
        <FeaturesSection dictionary={dictionary} locale={locale} />
        <SolutionsSection dictionary={dictionary} locale={locale} />
        <ScreenshotsSection dictionary={dictionary} locale={locale} />
        <TestimonialsSection dictionary={dictionary} locale={locale} />
       {/*  <PricingSection dictionary={dictionary} locale={locale} /> */}
        <FAQSection dictionary={dictionary} locale={locale} />
      </main>
      
      <LandingFooter dictionary={dictionary} locale={locale} />
    </div>
  )
}
