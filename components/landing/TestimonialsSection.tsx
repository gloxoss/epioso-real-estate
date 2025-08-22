'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Star, Quote } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface TestimonialsSectionProps {
  dictionary: any
  locale: Locale
}

export function TestimonialsSection({ dictionary, locale }: TestimonialsSectionProps) {
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const testimonials = [
    {
      id: 1,
      name: 'Ahmed Benali',
      title: 'Property Manager',
      company: 'Casablanca Real Estate',
      location: 'Casablanca, Morocco',
      rating: 5,
      text: 'Epiosio has transformed how we manage our 50+ property portfolio. The automated billing and maintenance tracking have saved us countless hours every month. The Arabic interface is perfect for our local team.',
      avatar: '/avatars/ahmed.jpg'
    },
    {
      id: 2,
      name: 'Fatima Zahra',
      title: 'Real Estate Investor',
      company: 'Atlas Properties',
      location: 'Rabat, Morocco',
      rating: 5,
      text: 'The analytics dashboard gives me incredible insights into my investments. I can track ROI, cash flow, and property performance all in one place. The mobile app lets me manage everything on the go.',
      avatar: '/avatars/fatima.jpg'
    },
    {
      id: 3,
      name: 'Youssef Tazi',
      title: 'CEO',
      company: 'Marrakech Property Management',
      location: 'Marrakech, Morocco',
      rating: 5,
      text: 'We switched from spreadsheets to Epiosio and never looked back. The tenant portal has reduced our support calls by 70%, and the automated rent collection has improved our cash flow significantly.',
      avatar: '/avatars/youssef.jpg'
    },
    {
      id: 4,
      name: 'Aicha Benjelloun',
      title: 'Property Owner',
      company: 'Individual Investor',
      location: 'Fez, Morocco',
      rating: 5,
      text: 'As a small landlord with 5 properties, I needed something simple but powerful. Epiosio is perfect - easy to use but has all the features I need. The document management is a game-changer.',
      avatar: '/avatars/aicha.jpg'
    },
    {
      id: 5,
      name: 'Omar Alami',
      title: 'Operations Director',
      company: 'Tangier Commercial Properties',
      location: 'Tangier, Morocco',
      rating: 5,
      text: 'The maintenance management module has revolutionized our operations. We can track all work orders, manage vendors, and keep detailed records. Our tenants love the quick response times.',
      avatar: '/avatars/omar.jpg'
    },
    {
      id: 6,
      name: 'Khadija Mansouri',
      title: 'Portfolio Manager',
      company: 'Agadir Residential Group',
      location: 'Agadir, Morocco',
      rating: 5,
      text: 'The multi-language support is fantastic for our diverse team. The French and Arabic interfaces make it easy for everyone to use. The reporting features help us make data-driven decisions.',
      avatar: '/avatars/khadija.jpg'
    }
  ]

  const nextTestimonial = () => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  // Auto-rotate testimonials
  useEffect(() => {
    const interval = setInterval(nextTestimonial, 5000)
    return () => clearInterval(interval)
  }, [nextTestimonial])

  return (
    <section className="py-24 bg-white dark:bg-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-slate-900 dark:text-white mb-4">
            Trusted by Property Professionals Across Morocco
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Join hundreds of property managers, investors, and landlords who have transformed 
            their business with Epiosio.
          </p>
        </div>

        {/* Main Testimonial */}
        <div className="relative max-w-4xl mx-auto">
          <div className="bg-slate-50 dark:bg-slate-800 rounded-3xl p-8 lg:p-12 relative overflow-hidden">
            {/* Quote Icon */}
            <div className="absolute top-6 right-6 opacity-10">
              <Quote className="h-24 w-24 text-blue-600" />
            </div>

            {/* Rating */}
            <div className="flex items-center justify-center mb-6">
              {[...Array(testimonials[currentTestimonial].rating)].map((_, i) => (
                <Star key={i} className="h-6 w-6 text-yellow-400 fill-current" />
              ))}
            </div>

            {/* Testimonial Text */}
            <blockquote className="text-xl lg:text-2xl text-slate-700 dark:text-slate-300 text-center mb-8 leading-relaxed font-medium">
              "{testimonials[currentTestimonial].text}"
            </blockquote>

            {/* Author */}
            <div className="flex items-center justify-center space-x-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                {testimonials[currentTestimonial].name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className="text-center">
                <div className="font-semibold text-slate-900 dark:text-white text-lg">
                  {testimonials[currentTestimonial].name}
                </div>
                <div className="text-slate-600 dark:text-slate-400">
                  {testimonials[currentTestimonial].title}
                </div>
                <div className="text-sm text-slate-500 dark:text-slate-500">
                  {testimonials[currentTestimonial].company} • {testimonials[currentTestimonial].location}
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center justify-center space-x-4 mt-8">
              <button
                onClick={prevTestimonial}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <ChevronLeft className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
              
              <div className="flex space-x-2">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      currentTestimonial === index
                        ? 'bg-blue-600 scale-125'
                        : 'bg-slate-300 dark:bg-slate-600 hover:bg-slate-400 dark:hover:bg-slate-500'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextTestimonial}
                className="w-12 h-12 rounded-full bg-white dark:bg-slate-700 shadow-lg border border-slate-200 dark:border-slate-600 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-200"
              >
                <ChevronRight className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </button>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-slate-600 dark:text-slate-400">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">4.9/5</div>
            <div className="text-slate-600 dark:text-slate-400">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">99.9%</div>
            <div className="text-slate-600 dark:text-slate-400">Uptime</div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-6">
            Ready to join our satisfied customers?
          </p>
          <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 text-lg">
            Start Your Free Trial Today
          </button>
        </div>
      </div>
    </section>
  )
}
