'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Ban, AlertTriangle, Loader2, X, ShieldAlert } from 'lucide-react';
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
  const [savedReason, setSavedReason] = useState<string | null>(null);

  // If already cancelled or successfully cancelled in this session, show cancellation status banner
  if (status === 'CANCELLED' || success) {
    const displayReason =
      savedReason ||
      (customerNotes && customerNotes.includes('[Customer Cancellation Reason]')
        ? customerNotes
            .split('\n')
            .filter((l) => l.includes('Cancellation Reason'))
            .pop()
            ?.replace('[Customer Cancellation Reason]:', '')
            .trim()
        : null);

    return (
      <div className="bg-rose-50 border border-rose-200 rounded-2xl p-5 text-xs text-rose-900 flex items-start gap-3 shadow-xs">
        <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Ban className="w-4 h-4" />
        </div>
        <div className="flex-1">
          <span className="font-bold text-sm text-rose-950 block mb-1">
            Booking Cancelled
          </span>
          <span className="leading-relaxed text-rose-800 block">
            This booking has been cancelled. Vehicle reservation and chauffeur assignment have been released.
          </span>
          {displayReason && (
            <div className="mt-2.5 pt-2 border-t border-rose-200/80 text-[11px] text-rose-700">
              <strong className="text-rose-900 font-semibold">Reason: </strong>
              <span className="italic">{displayReason}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // If completed or rejected, cancellation is not permitted
  if (status === 'COMPLETED' || status === 'REJECTED') {
    return null;
  }

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedPhone = phone.trim();
    if (!trimmedPhone) {
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
          customerPhone: trimmedPhone,
          reason: reason.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to cancel booking. Please verify your phone number.');
      }

      setSavedReason(reason.trim() || null);
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
      <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
        <span>Need to cancel this booking inquiry or scheduled trip?</span>
        <button
          type="button"
          onClick={() => {
            setError(null);
            setIsOpen(true);
          }}
          className="text-rose-600 hover:text-rose-800 font-bold hover:underline transition-colors inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-rose-50 border border-transparent hover:border-rose-200"
        >
          <Ban className="w-3.5 h-3.5" />
          <span>Cancel Booking</span>
        </button>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl my-8 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2 text-rose-600">
                <div className="w-8 h-8 rounded-xl bg-rose-50 flex items-center justify-center">
                  <ShieldAlert className="w-5 h-5 text-rose-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Cancel Booking #{bookingRef}
                  </h3>
                  <span className="text-[11px] text-slate-400 block">
                    Customer Cancellation Request
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (!isSubmitting) {
                    setIsOpen(false);
                    setError(null);
                  }
                }}
                disabled={isSubmitting}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close modal"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              Are you sure you want to cancel this booking? This will release the allocated vehicle and cancel your scheduled pickup.
            </p>

            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span className="font-medium leading-tight">{error}</span>
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
                  placeholder="e.g. 9919379147"
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs disabled:bg-slate-100"
                  required
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Required for security verification matching your booking.
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
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none text-xs disabled:bg-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setError(null);
                  }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-4 py-2 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Keep Booking
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold px-4 py-2 rounded-xl shadow-xs transition-colors disabled:opacity-70"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Cancelling Booking...</span>
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
