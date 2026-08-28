'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, MessageCircle, PhoneCall } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

interface CustomerErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function CustomerError({ error, reset }: CustomerErrorProps) {
  useEffect(() => {
    console.error('[Customer Portal Error]:', error?.message || error);
  }, [error]);

  return (
    <div className="min-h-[60vh] bg-slate-50 flex items-center justify-center p-4 py-16">
      <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm text-center">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <AlertCircle className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold text-amber-600 uppercase tracking-wider block mb-1">
          Temporary Connection Notice
        </span>
        <h2 className="text-2xl font-extrabold text-slate-900 mb-2">
          Unable to load page content
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 mb-6 leading-relaxed">
          We could not load the requested trip or fleet data right now. Please reload or contact our dispatch desk.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-5 rounded-xl shadow-sm transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Content</span>
          </button>
          <Link
            href="/"
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold py-3 px-5 rounded-xl transition-colors flex items-center justify-center gap-2 text-xs"
          >
            <Home className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-center gap-4 text-xs text-slate-500">
          <a
            href={`tel:${companyConfig.phone}`}
            className="text-blue-600 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Call {companyConfig.phoneDisplay}</span>
          </a>
          <span className="hidden sm:inline text-slate-300">•</span>
          <a
            href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-emerald-600 hover:underline font-semibold inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}
