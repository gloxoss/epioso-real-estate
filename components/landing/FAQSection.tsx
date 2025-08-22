'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface FAQSectionProps {
  dictionary: any
  locale: Locale
}

export function FAQSection({ dictionary, locale }: FAQSectionProps) {
  const [openFAQ, setOpenFAQ] = useState<number | null>(0)

  const faqs = [
    {
      question: 'What is Epiosio and how does it work?',
      answer: 'Epiosio is a comprehensive property management platform designed specifically for the Moroccan real estate market. It helps property managers, investors, and landlords streamline their operations with features like automated rent collection, maintenance tracking, tenant management, and financial reporting. The platform works by centralizing all your property data in one secure, easy-to-use dashboard accessible from any device.'
    },
    {
      question: 'Is there a free trial available?',
      answer: 'Yes! We offer a 14-day free trial for all our plans. No credit card required to start. During the trial, you\'ll have access to all features of your chosen plan, allowing you to fully evaluate how Epiosio can benefit your property management business. You can cancel anytime during the trial period with no charges.'
    },
    {
      question: 'What languages does Epiosio support?',
      answer: 'Epiosio supports three languages: Arabic, French, and English. The interface, reports, and all communications can be switched between these languages instantly. This makes it perfect for the diverse Moroccan market where property managers often work with tenants and clients who speak different languages.'
    },
    {
      question: 'How secure is my data with Epiosio?',
      answer: 'Security is our top priority. We use bank-level encryption (256-bit SSL) to protect all data in transit and at rest. Our servers are hosted in secure data centers with 24/7 monitoring, regular security audits, and compliance with international data protection standards. We also perform regular backups and have disaster recovery procedures in place.'
    },
    {
      question: 'Can I import my existing property data?',
      answer: 'Absolutely! We provide data import tools and services to help you migrate from spreadsheets, other property management software, or manual records. Our support team can assist with the import process to ensure all your existing property, tenant, and financial data is transferred accurately. We support various file formats including CSV, Excel, and direct database imports.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major payment methods including credit cards (Visa, Mastercard), bank transfers, and local Moroccan payment methods. For annual subscriptions, we also offer invoice-based payments for businesses. All payments are processed securely through encrypted payment gateways.'
    },
    {
      question: 'Do you offer customer support in Arabic and French?',
      answer: 'Yes! Our customer support team is multilingual and provides assistance in Arabic, French, and English. We offer support through email, phone, and live chat during business hours (9 AM - 6 PM Morocco time). Premium and Enterprise customers also get priority support with faster response times.'
    },
    {
      question: 'Can I customize the platform for my brand?',
      answer: 'Professional and Enterprise plans include custom branding options. You can add your company logo, customize colors, and personalize the tenant portal with your branding. Enterprise customers can also get white-label solutions where the platform appears completely under your brand name.'
    },
    {
      question: 'What happens if I need to cancel my subscription?',
      answer: 'You can cancel your subscription at any time from your account settings. There are no cancellation fees or long-term contracts. If you cancel during a billing period, you\'ll continue to have access until the end of that period. We also offer a 30-day money-back guarantee if you\'re not satisfied with the service.'
    },
    {
      question: 'Do you provide training and onboarding?',
      answer: 'Yes! All new customers receive comprehensive onboarding including setup assistance, data import help, and training sessions. We provide video tutorials, documentation, and live training sessions. Enterprise customers get dedicated account managers and personalized training programs for their teams.'
    },
    {
      question: 'Can Epiosio handle multiple property types?',
      answer: 'Absolutely! Epiosio is designed to handle all types of properties including residential apartments, commercial spaces, office buildings, retail properties, mixed-use developments, and more. Each property type can have customized settings, different lease terms, and specific management requirements.'
    },
    {
      question: 'Is there a mobile app available?',
      answer: 'Yes! We have full-featured mobile apps for both iOS and Android. The mobile apps allow you to manage properties, communicate with tenants, approve maintenance requests, view reports, and access all key features on the go. Tenants also get their own mobile app for rent payments and maintenance requests.'
    }
  ]

  const toggleFAQ = (index: number) => {
    setOpenFAQ(openFAQ === index ? null : index)
  }

  return (
    <section id="faq" className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-2xl mb-6">
            <HelpCircle className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400">
            Everything you need to know about Epiosio. Can't find the answer you're looking for? 
            <a href="#contact" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 ml-1">
              Contact our support team
            </a>.
          </p>
        </div>

        {/* FAQ List */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-6 text-left flex items-center justify-between hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors duration-200"
              >
                <span className="text-lg font-semibold text-slate-900 dark:text-white pr-4">
                  {faq.question}
                </span>
                <div className="flex-shrink-0">
                  {openFAQ === index ? (
                    <ChevronUp className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500 dark:text-slate-400" />
                  )}
                </div>
              </button>
              
              {openFAQ === index && (
                <div className="px-6 pb-6">
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-600">
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 border border-blue-200 dark:border-blue-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Still have questions?
            </h3>
            <p className="text-slate-600 dark:text-slate-400 mb-6">
              Our friendly support team is here to help. Get in touch and we'll get back to you as soon as possible.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200">
                Contact Support
              </button>
              <button className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 font-semibold rounded-lg transition-colors duration-200">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
