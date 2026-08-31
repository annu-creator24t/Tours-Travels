'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Car,
  ShieldCheck,
  MapPin,
  Calendar,
  ArrowRight,
  Sparkles,
  Compass,
} from 'lucide-react';
import { companyConfig } from '@/lib/company.config';
import LocationAutocompleteInput from '@/components/ui/LocationAutocompleteInput';

export default function HomePage() {
  const router = useRouter();
  const [pickup, setPickup] = useState('');
  const [destination, setDestination] = useState('');
  const [travelDate, setTravelDate] = useState('');
  const [tripType, setTripType] = useState('ONE_WAY');

  const handleQuickInquiry = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (pickup) params.set('pickup', pickup);
    if (destination) params.set('destination', destination);
    if (travelDate) params.set('date', travelDate);
    if (tripType) params.set('tripType', tripType);
    router.push(`/book?${params.toString()}`);
  };

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Outstation Car Rental & Tour Operator</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Comfortable, Reliable Fleet for Every Journey
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Explore outstation trips, family tours, and airport transfers with
              our well-maintained fleet of Sedans, Innova Crystas, and Tempo
              Travellers.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <Link
                href="/vehicles"
                className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3.5 rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center space-x-2"
              >
                <span>Explore Our Fleet</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/book"
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-semibold px-6 py-3.5 rounded-xl transition-all"
              >
                Instant Booking Request
              </Link>
            </div>
          </div>

          {/* Quick Search Preview Widget */}
          <div className="lg:col-span-5 bg-white text-slate-900 p-6 sm:p-8 rounded-2xl shadow-2xl border border-slate-100">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Quick Trip Inquiry</h3>
            <form onSubmit={handleQuickInquiry} className="space-y-3.5 text-sm">
              <div className="grid grid-cols-2 gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setTripType('ONE_WAY')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    tripType === 'ONE_WAY'
                      ? 'bg-blue-50 text-blue-700 border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  One Way Drop
                </button>
                <button
                  type="button"
                  onClick={() => setTripType('ROUND_TRIP')}
                  className={`py-1.5 px-2 rounded-lg text-xs font-bold transition-all border ${
                    tripType === 'ROUND_TRIP'
                      ? 'bg-blue-50 text-blue-700 border-blue-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  Round Trip
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pickup Location
                </label>
                <LocationAutocompleteInput
                  value={pickup}
                  onChange={setPickup}
                  placeholder="Enter pickup city or landmark"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Destination / Drop City
                </label>
                <LocationAutocompleteInput
                  value={destination}
                  onChange={setDestination}
                  placeholder="Enter destination city"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Travel Date & Time
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="datetime-local"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-4 shadow-sm"
              >
                Proceed to Book Vehicle
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Trust Highlights */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
              <Car className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Well-Maintained Fleet</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Spotless, sanitized vehicles inspected before every single trip.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Professional Chauffeurs</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Polite, licensed, and experienced highway drivers for safe travel.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Compass className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Transparent Estimates</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Clear per-km rates with zero hidden charges and booking reference tracking.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

