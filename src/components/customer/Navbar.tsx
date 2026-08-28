'use client';

import React from 'react';
import Link from 'next/link';
import { Phone, Compass } from 'lucide-react';

export const Navbar: React.FC = () => {
  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-md">
            <Compass className="w-6 h-6" />
          </div>
          <div>
            <span className="text-lg font-bold text-slate-900 leading-none block">
              Tours & Travels
            </span>
            <span className="text-xs text-blue-600 font-semibold tracking-wider uppercase">
              Premium Fleet
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
          <Link href="/reviews" className="hover:text-blue-600 transition-colors">
            Reviews
          </Link>
          <Link href="/contact" className="hover:text-blue-600 transition-colors">
            Contact
          </Link>
        </nav>

        <div className="flex items-center space-x-3">
          <a
            href="tel:+919876543210"
            className="hidden sm:flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors"
          >
            <Phone className="w-3.5 h-3.5 text-blue-600" />
            <span>Call Support</span>
          </a>
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
