import React from 'react';
import type { Metadata } from 'next';
import '@/styles/globals.css';
import { companyConfig } from '@/lib/company.config';

const baseUrl = (
  process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
).replace(/\/+$/, '');

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: `${companyConfig.name} — Outstation Car Rental & Tours`,
    template: `%s | ${companyConfig.name}`,
  },
  description: companyConfig.description,
  keywords: [
    'Car Rental',
    'Tours and Travels',
    'Outstation Cabs',
    'Varanasi Taxi',
    'Chauffeur Services',
    'Innova Rental',
    'Tempo Traveller',
    'Airport Transfer',
    'Pilgrimage Tours',
  ],
  authors: [{ name: companyConfig.name }],
  creator: companyConfig.name,
  publisher: companyConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: baseUrl,
    siteName: companyConfig.name,
    title: `${companyConfig.name} — Outstation Car Rental & Tours`,
    description: companyConfig.description,
    images: [
      {
        url: '/images/hero-fleet.jpg',
        width: 1200,
        height: 630,
        alt: companyConfig.name,
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
