import React from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const metadata: Metadata = {
  title: `Contact Us — ${companyConfig.name}`,
  description: `Reach out to ${companyConfig.name} for outstation cab bookings, pilgrimage tour quotes, and fleet inquiries. 24/7 customer support.`,
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/contact',
    siteName: companyConfig.name,
    title: `Contact Us — ${companyConfig.name}`,
    description: `Reach out to ${companyConfig.name} for outstation cab bookings, pilgrimage tour quotes, and fleet inquiries. 24/7 customer support.`,
    images: [
      {
        url: '/images/hero-fleet.jpg',
        width: 1200,
        height: 630,
        alt: `${companyConfig.name} Contact Support`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Contact Us — ${companyConfig.name}`,
    description: `Reach out to ${companyConfig.name} for outstation cab bookings, pilgrimage tour quotes, and fleet inquiries.`,
    images: ['/images/hero-fleet.jpg'],
  },
};

export default function ContactPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Have questions about pricing, route packages, or vehicle availability?
          We are here to assist 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Phone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Phone Support</h3>
          <p className="text-xs text-slate-500 mb-3">Instant booking assistance</p>
          <a
            href="tel:+919876543210"
            className="text-sm font-semibold text-blue-600 hover:underline"
          >
            +91 98765 43210
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">WhatsApp Chat</h3>
          <p className="text-xs text-slate-500 mb-3">Quick response for quotes</p>
          <a
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold text-emerald-600 hover:underline"
          >
            Chat with Us
          </a>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Mail className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-900 mb-1">Email Inquiries</h3>
          <p className="text-xs text-slate-500 mb-3">Corporate & bulk bookings</p>
          <a
            href="mailto:contact@tourstravels.com"
            className="text-sm font-semibold text-indigo-600 hover:underline"
          >
            contact@tourstravels.com
          </a>
        </div>
      </div>
    </div>
  );
}
