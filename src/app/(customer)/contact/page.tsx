import React from 'react';
import type { Metadata } from 'next';
import { Phone, Mail, MessageCircle, PhoneCall } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const metadata: Metadata = {
  title: `Contact Us — ${companyConfig.name}`,
  description: `Reach out to ${companyConfig.name} for outstation cab bookings, pilgrimage tour quotes, and fleet inquiries. 24/7 customer support on ${companyConfig.phoneDisplay}.`,
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
  const getWaUrl = (number: string) => {
    const clean = number.replace(/[^0-9]/g, '');
    return `https://wa.me/${clean}?text=${encodeURIComponent(
      `Hello ${companyConfig.name}, I would like to inquire about booking a trip.`
    )}`;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Get in Touch
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Have questions about pricing, route packages, or vehicle availability?
          Our dispatch coordinators are available 24/7 on both helplines.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Phone Support */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Phone Support</h3>
            <p className="text-xs text-slate-500 mb-4">Direct voice calls for instant assistance</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                24/7 Helpline
              </span>
              <a
                href={`tel:${companyConfig.phone}`}
                className="text-base font-bold text-blue-600 hover:text-blue-800 transition-colors inline-flex items-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>{companyConfig.phoneDisplay}</span>
              </a>
              <span className="text-[11px] text-slate-400 block mt-1">
                Instant booking assistance & dispatch
              </span>
            </div>
          </div>
        </div>

        {/* WhatsApp Chat */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <MessageCircle className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">WhatsApp Chat</h3>
            <p className="text-xs text-slate-500 mb-4">Fast response for route itineraries and quotes</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-100">
              <span className="text-[10px] uppercase font-bold text-emerald-700 block mb-1">
                Official WhatsApp Desk
              </span>
              <a
                href={getWaUrl(companyConfig.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base font-bold text-emerald-700 hover:text-emerald-900 transition-colors inline-flex items-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{companyConfig.whatsappDisplay}</span>
              </a>
              <span className="text-[11px] text-emerald-800/80 block mt-1">
                Quick quotes & vehicle availability
              </span>
            </div>
          </div>
        </div>

        {/* Email Support */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 text-center shadow-sm flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 mb-1">Email Support</h3>
            <p className="text-xs text-slate-500 mb-4">Corporate & tour inquiries</p>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-left">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">
                Email Inquiries
              </span>
              <a
                href={`mailto:${companyConfig.email}`}
                className="font-semibold text-indigo-600 hover:underline break-all block text-sm"
              >
                {companyConfig.email}
              </a>
              <span className="text-[11px] text-slate-500 block mt-1">
                Online bookings & assistance
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
