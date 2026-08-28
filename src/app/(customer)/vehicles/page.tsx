import React from 'react';
import Link from 'next/link';
import { Car, Users, Briefcase, Snowflake, ArrowRight } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const metadata = {
  title: 'Our Fleet — Jay Maa Sheetala Tours & Travel',
  description: 'Explore our fleet of sedans, SUVs, and luxury tempo travellers.',
};

export default function VehiclesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Explore Our Fleet
        </h1>
        <p className="mt-3 text-sm sm:text-base text-slate-600">
          Clean, air-conditioned, and serviced vehicles tailored for solo,
          family, and group outstation travel.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Placeholder Fleet Card 1 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
            <Car className="w-16 h-16" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase">Sedan</span>
              <Badge variant="success">Available</Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Swift Dzire / Etios</h3>
            <p className="text-xs text-slate-500 mb-4">
              Perfect for budget-friendly couples & small family trips.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mb-6 py-3 border-y border-slate-100">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" /> 4 Seats
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-slate-400" /> 2 Bags
              </span>
              <span className="flex items-center gap-1">
                <Snowflake className="w-4 h-4 text-slate-400" /> AC
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Starting from</span>
                <span className="text-lg font-extrabold text-slate-900">₹12/km</span>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Placeholder Fleet Card 2 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
            <Car className="w-16 h-16" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase">Premium SUV</span>
              <Badge variant="success">Available</Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Innova Crysta</h3>
            <p className="text-xs text-slate-500 mb-4">
              Ultimate comfort for long distance family journeys.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mb-6 py-3 border-y border-slate-100">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" /> 7 Seats
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-slate-400" /> 4 Bags
              </span>
              <span className="flex items-center gap-1">
                <Snowflake className="w-4 h-4 text-slate-400" /> AC
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Starting from</span>
                <span className="text-lg font-extrabold text-slate-900">₹18/km</span>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Placeholder Fleet Card 3 */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
          <div className="h-48 bg-slate-100 flex items-center justify-center text-slate-400">
            <Car className="w-16 h-16" />
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-blue-600 uppercase">Tempo Traveller</span>
              <Badge variant="success">Available</Badge>
            </div>
            <h3 className="text-lg font-bold text-slate-900">Force Traveller 17 Seater</h3>
            <p className="text-xs text-slate-500 mb-4">
              Spacious and luxurious for group tours and weddings.
            </p>

            <div className="flex items-center gap-4 text-xs text-slate-600 mb-6 py-3 border-y border-slate-100">
              <span className="flex items-center gap-1">
                <Users className="w-4 h-4 text-slate-400" /> 17 Seats
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="w-4 h-4 text-slate-400" /> 12 Bags
              </span>
              <span className="flex items-center gap-1">
                <Snowflake className="w-4 h-4 text-slate-400" /> AC
              </span>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-slate-500 block">Starting from</span>
                <span className="text-lg font-extrabold text-slate-900">₹26/km</span>
              </div>
              <Link
                href="/book"
                className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg transition-colors"
              >
                <span>Book Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
