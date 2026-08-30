import React from 'react';
import Link from 'next/link';
import { Compass, Home, PhoneCall } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Compass className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-blue-600 uppercase tracking-wider block mb-1">
          404 Error
        </span>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-2">
          Page Not Found
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="space-y-3">
          <Link
            href="/"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Return to Homepage</span>
          </Link>
          <Link
            href="/vehicles"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <span>Explore Vehicle Fleet</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 text-xs text-slate-500">
          <span>Need immediate assistance? </span>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <a
              href={`tel:${companyConfig.phone}`}
              className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
              title="Helpline 1"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{companyConfig.phoneDisplay}</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href={`tel:${companyConfig.phone2}`}
              className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
              title="Helpline 2"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{companyConfig.phone2Display}</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
