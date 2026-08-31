'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Search } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2.5 group">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0 shadow-sm border border-slate-200/80 bg-slate-950">
            <Image
              src={companyConfig.logoUrl}
              alt={companyConfig.name}
              fill
              sizes="(max-width: 640px) 40px, 44px"
              className="object-contain p-0.5"
              priority
              unoptimized
            />
          </div>
          <div>
            <span className="text-sm sm:text-base font-extrabold text-slate-900 leading-tight block group-hover:text-blue-600 transition-colors">
              {companyConfig.name}
            </span>
            <span className="text-[10px] sm:text-xs text-blue-600 font-semibold tracking-wider uppercase">
              Outstation & Fleet Rentals
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate-700">
          <Link href="/" className="hover:text-blue-600 transition-colors">
            Home
          </Link>
          <Link href="/vehicles" className="hover:text-blue-600 transition-colors">
            Our Fleet
          </Link>
          <Link href="/booking" className="hover:text-blue-600 transition-colors inline-flex items-center gap-1">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Track Booking</span>
          </Link>
          <Link href="/reviews" className="hover:text-blue-600 transition-colors">
            Reviews
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="hidden sm:flex items-center space-x-2">
            <a
              href={`tel:${companyConfig.phone}`}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
              title={`Call: ${companyConfig.phoneDisplay}`}
            >
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              <span>{companyConfig.phoneDisplay}</span>
            </a>
          </div>

          <Link
            href="/book"
            className="text-xs sm:text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            Book a Trip
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;

