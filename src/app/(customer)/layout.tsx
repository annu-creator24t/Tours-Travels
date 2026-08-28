import React from 'react';
import Navbar from '@/components/customer/Navbar';
import Footer from '@/components/customer/Footer';
import WhatsAppFloatingBtn from '@/components/customer/WhatsAppFloatingBtn';

import type { Metadata } from 'next';
import { companyConfig } from '@/lib/company.config';

export const metadata: Metadata = {
  title: {
    default: `${companyConfig.name} — Outstation Car Rental & Tours`,
    template: `%s | ${companyConfig.name}`,
  },
  description: companyConfig.description,
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/',
    siteName: companyConfig.name,
    title: `${companyConfig.name} — Outstation Car Rental & Tours`,
    description: companyConfig.description,
    images: [
      {
        url: '/images/hero-fleet.jpg',
        width: 1200,
        height: 630,
        alt: `${companyConfig.name} Fleet`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${companyConfig.name} — Outstation Car Rental & Tours`,
    description: companyConfig.description,
    images: ['/images/hero-fleet.jpg'],
  },
};

export default function CustomerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>
      <Footer />
      <WhatsAppFloatingBtn />
    </div>
  );
}
