'use client'

import Link from 'next/link'
import { Mail, Phone, MapPin, Facebook, Twitter, Linkedin, Instagram } from 'lucide-react'
import { type Locale } from '@/lib/i18n/config'

interface LandingFooterProps {
  dictionary: any
  locale: Locale
}

export function LandingFooter({ dictionary, locale }: LandingFooterProps) {
  const footerLinks = {
    product: [
      { name: 'Features', href: '#features' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Screenshots', href: '#screenshots' },
      { name: 'API Documentation', href: '/docs' },
      { name: 'Integrations', href: '/integrations' },
    ],
    company: [
      { name: 'About Us', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Press', href: '/press' },
      { name: 'Partners', href: '/partners' },
      { name: 'Contact', href: '/contact' },
    ],
    resources: [
      { name: 'Help Center', href: '/help' },
      { name: 'Blog', href: '/blog' },
      { name: 'Tutorials', href: '/tutorials' },
      { name: 'Webinars', href: '/webinars' },
      { name: 'Case Studies', href: '/case-studies' },
    ],
    legal: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
      { name: 'Cookie Policy', href: '/cookies' },
      { name: 'GDPR Compliance', href: '/gdpr' },
      { name: 'Security', href: '/security' },
    ],
  }

  const socialLinks = [
    { name: 'Facebook', icon: Facebook, href: 'https://facebook.com/epiosio' },
    { name: 'Twitter', icon: Twitter, href: 'https://twitter.com/epiosio' },
    { name: 'LinkedIn', icon: Linkedin, href: 'https://linkedin.com/company/epiosio' },
    { name: 'Instagram', icon: Instagram, href: 'https://instagram.com/epiosio' },
  ]

  return (
    <footer className="bg-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-6">
              <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">E</span>
              </div>
              <span className="text-xl font-bold">Epiosio</span>
            </div>
            
            <p className="text-slate-400 mb-6 leading-relaxed">
              The leading property management platform for the Moroccan real estate market. 
              Streamline your operations, increase efficiency, and grow your business with our 
              comprehensive suite of tools.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">contact@epiosio.com</span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">+212 5XX-XXXXXX</span>
              </div>
              <div className="flex items-center space-x-3">
                <MapPin className="h-5 w-5 text-slate-400" />
                <span className="text-slate-400">Casablanca, Morocco</span>
              </div>
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-slate-400 hover:text-white transition-colors duration-200"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter Signup */}
        <div className="border-t border-slate-800 pt-12 mb-12">
          <div className="max-w-md mx-auto text-center lg:text-left lg:max-w-none lg:flex lg:items-center lg:justify-between">
            <div className="lg:flex-1">
              <h3 className="text-lg font-semibold mb-2">Stay Updated</h3>
              <p className="text-slate-400 mb-4 lg:mb-0">
                Get the latest updates, tips, and insights delivered to your inbox.
              </p>
            </div>
            <div className="lg:flex-shrink-0 lg:ml-8">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 whitespace-nowrap">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="border-t border-slate-800 pt-8">
          <div className="flex flex-col lg:flex-row items-center justify-between">
            {/* Copyright */}
            <div className="text-slate-400 text-sm mb-4 lg:mb-0">
              © 2024 Epiosio. All rights reserved.
            </div>

            {/* Legal Links */}
            <div className="flex flex-wrap items-center gap-6 mb-4 lg:mb-0">
              {footerLinks.legal.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="text-slate-400 hover:text-white transition-colors duration-200 text-sm"
                >
                  {link.name}
                </Link>
              ))}
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-slate-800 hover:bg-slate-700 rounded-lg flex items-center justify-center transition-colors duration-200"
                >
                  <social.icon className="h-5 w-5 text-slate-400 hover:text-white" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Language Selector for Footer */}
      <div className="bg-slate-950 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-6 text-sm">
            <span className="text-slate-400">Available in:</span>
            <Link
              href="/en"
              className={`text-slate-400 hover:text-white transition-colors duration-200 ${
                locale === 'en' ? 'text-white font-medium' : ''
              }`}
            >
              🇺🇸 English
            </Link>
            <Link
              href="/fr"
              className={`text-slate-400 hover:text-white transition-colors duration-200 ${
                locale === 'fr' ? 'text-white font-medium' : ''
              }`}
            >
              🇫🇷 Français
            </Link>
            <Link
              href="/ar"
              className={`text-slate-400 hover:text-white transition-colors duration-200 ${
                locale === 'ar' ? 'text-white font-medium' : ''
              }`}
            >
              🇲🇦 العربية
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
