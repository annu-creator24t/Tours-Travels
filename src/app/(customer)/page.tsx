import React from 'react';
import Link from 'next/link';
import { Car, ShieldCheck, Star, MapPin, Calendar, Clock, ArrowRight } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 border border-blue-400/30 px-3.5 py-1.5 rounded-full text-xs font-semibold text-blue-300">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
              <span>4.9/5 Rating on Justdial & Google Reviews</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Comfortable, Reliable & Premium Fleet for Every Journey
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
            <div className="space-y-3.5 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Pickup Location
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Enter pickup city/address"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="Enter destination"
                    className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Travel Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Select date"
                      className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Time
                  </label>
                  <div className="relative">
                    <Clock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      placeholder="Select time"
                      className="w-full pl-9 pr-2 py-2.5 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      readOnly
                    />
                  </div>
                </div>
              </div>

              <Link
                href="/book"
                className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg text-sm transition-colors mt-2"
              >
                Proceed to Book Vehicle
              </Link>
            </div>
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
              <h4 className="font-bold text-slate-900 mb-1">Verified Drivers</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Polite, licensed, and highly experienced highway drivers.
              </p>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-start space-x-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
              <Star className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-slate-900 mb-1">Transparent Pricing</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Zero hidden charges. Clear advance and trip estimates.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
