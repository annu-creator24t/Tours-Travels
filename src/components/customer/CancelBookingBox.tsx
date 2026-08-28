'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, AlertTriangle, Loader2, CheckCircle2, X } from 'lucide-react';
import { BookingStatus } from '@prisma/client';

interface CancelBookingBoxProps {
  bookingRef: string;
  status: BookingStatus;
  customerNotes?: string | null;
}

export default function CancelBookingBox({
  bookingRef,
  status,
  customerNotes,
}: CancelBookingBoxProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // If already cancelled, show cancellation status banner
  if (status === 'CANCELLED' || success) {
    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900 flex items-start gap-3 shadow-xs">
        <Ban className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1">Booking Cancelled</span>
          <span className="leading-relaxed block">
            This booking has been cancelled. Vehicle reservation and driver assignment have been released.
          </span>
          {customerNotes && customerNotes.includes('[Customer Cancellation Reason]') && (
            <p className="mt-2 text-rose-700 italic border-t border-rose-200/60 pt-1.5 text-[11px]">
              {customerNotes.split('\n').filter((l) => l.includes('Cancellation Reason')).pop()}
            </p>
          )}
        </div>
      </div>
    );
  }

  // If completed, cancellation is not allowed
  if (status === 'COMPLETED') {
    return null;
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) {
      setError('Please enter your registered mobile number for verification');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/bookings/${encodeURIComponent(bookingRef)}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerPhone: phone.trim(),
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel booking');
      }

      setSuccess(true);
      setIsOpen(false);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error processing cancellation');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span>Need to cancel this booking inquiry or trip?</span>
        <button
          onClick={() => setIsOpen(true)}
          className="text-rose-600 hover:text-rose-800 font-semibold hover:underline transition-colors inline-flex items-center gap-1"
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Cancel Booking</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <Ban className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Cancel Booking #{bookingRef}
                </h3>
              </div>
              <button
                onClick={() => {
                  setIsOpen(false);
                  setError(null);
                }}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to cancel this booking? This will release the allocated vehicle and cancel scheduled pickup.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleCancelSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Registered Mobile Number *
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone used when booking"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Required for security verification.
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1">
                  Reason for Cancellation (Optional)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Change in travel plans, emergency, etc."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling...</span>
                    </>
                  ) : (
                    <span>Confirm Cancellation</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
