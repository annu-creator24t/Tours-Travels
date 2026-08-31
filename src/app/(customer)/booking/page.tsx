'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Compass, ShieldCheck, ArrowRight, PhoneCall, MessageCircle, AlertCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export default function TrackBookingLookupPage() {
  const router = useRouter();
  const [bookingRef, setBookingRef] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanRef = bookingRef.trim().toUpperCase();

    if (!cleanRef) {
      setError('Please enter your booking reference ID');
      return;
    }

    setIsSearching(true);
    setError(null);
    router.push(`/booking/${encodeURIComponent(cleanRef)}`);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 sm:py-16">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-200/60">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Trip Status & Real-Time Tracking</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Track Your Booking
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Enter your unique booking reference (e.g. <strong>TT-2026-XXXX</strong>) to view trip confirmation, allocated fleet vehicle, and driver details.
          </p>
        </div>

        {/* Lookup Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm mb-10">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label htmlFor="bookingRefInput" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Booking Reference ID
              </label>
              <div className="relative">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
                <input
                  id="bookingRefInput"
                  type="text"
                  value={bookingRef}
                  onChange={(e) => setBookingRef(e.target.value)}
                  placeholder="e.g. TT-2026-1001"
                  className="w-full pl-12 pr-4 py-3.5 border border-slate-300 rounded-xl text-base font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:ring-2 focus:ring-blue-500 focus:outline-none uppercase"
                  required
                />
              </div>
              <span className="text-[11px] text-slate-400 mt-1.5 block">
                The reference code was displayed upon booking submission and shared via confirmation.
              </span>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-sm disabled:opacity-70"
            >
              <span>{isSearching ? 'Looking up Booking...' : 'Track Booking Status'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Support Assistance */}
          <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-600">
            <span>Can&apos;t find your reference ID?</span>
            <div className="flex flex-wrap items-center gap-3">
              <a
                href={`tel:${companyConfig.phone}`}
                className="font-semibold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
                title="Helpline"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>{companyConfig.phoneDisplay}</span>
              </a>
              <span className="text-slate-300">•</span>
              <a
                href={companyConfig.contacts[0].whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Informative Booking Steps */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <h3 className="font-bold text-slate-900 text-sm mb-4">How Our Booking Confirmation Works</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">1. Pending Review</span>
              <span>Our fleet coordinator reviews vehicle availability and calculates the transparent trip quote.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">2. Driver Allocation</span>
              <span>Upon confirmation, vehicle assignment and licensed chauffeur details are attached to your booking.</span>
            </div>
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
              <span className="font-bold text-slate-900 block mb-1">3. Doorstep Pickup</span>
              <span>Your driver arrives at your specified doorstep / airport pickup location on time.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
