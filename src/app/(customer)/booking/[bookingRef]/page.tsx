import React from 'react';
import Link from 'next/link';
import { Clock, ShieldAlert, ArrowLeft } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export default function BookingStatusPage({
  params,
}: {
  params: { bookingRef: string };
}) {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Link
        href="/"
        className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-900 mb-6 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Home
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8" />
        </div>

        <Badge variant="warning">Inquiry Under Review</Badge>

        <h1 className="text-2xl font-bold text-slate-900 mt-3">
          Booking Reference #{params.bookingRef}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Thank you! Our operations team is currently checking vehicle and driver
          availability for your requested dates.
        </p>

        <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 my-6 text-left text-xs space-y-2">
          <div className="flex justify-between">
            <span className="text-slate-500">Booking Reference:</span>
            <span className="font-bold text-slate-900">{params.bookingRef}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Status:</span>
            <span className="font-semibold text-amber-600">Pending Admin Confirmation</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Next Step:</span>
            <span className="text-slate-700">Admin will share quote & payment link</span>
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Need immediate support? Contact our 24/7 hotline at{' '}
          <a href="tel:+919876543210" className="text-blue-600 font-semibold underline">
            +91 98765 43210
          </a>
        </p>
      </div>
    </div>
  );
}
