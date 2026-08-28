'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
  X,
  Car,
  MapPin,
  Calendar,
} from 'lucide-react';

interface AdvancePaymentBoxProps {
  bookingRef: string;
  status: string;
  vehicleName?: string | null;
  pickupLocation?: string;
  dropLocation?: string;
  pickupDatetime?: string | Date;
  finalPrice?: number | null;
  advanceAmount?: number | null;
  balanceAmount?: number | null;
  isAdvancePaid: boolean;
  paidTransactionRef?: string | null;
}

export default function AdvancePaymentBox({
  bookingRef,
  status,
  vehicleName,
  pickupLocation,
  dropLocation,
  pickupDatetime,
  finalPrice,
  advanceAmount,
  balanceAmount,
  isAdvancePaid,
  paidTransactionRef,
}: AdvancePaymentBoxProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
    gatewayName?: string;
    keyId?: string;
  } | null>(null);

  const finalPriceNum = Number(finalPrice || 0);
  const advanceNum = Number(advanceAmount || 0);
  const remainingBalance = Number(
    balanceAmount !== null && balanceAmount !== undefined
      ? balanceAmount
      : Math.max(0, finalPriceNum - advanceNum)
  );

  // 1. If Booking is still PENDING
  if (status === 'PENDING') {
    return (
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1">Advance Payment Status</span>
          <span>
            Payment is not available yet. Once our operations team reviews and confirms
            your trip details with a finalized quote, the advance payment option will be enabled here.
          </span>
        </div>
      </div>
    );
  }

  // 2. If Advance is already PAID
  if (isAdvancePaid) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 mb-3">
          <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Advance Payment Received</span>
          </div>
          <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
            PAID
          </span>
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between">
            <span className="text-emerald-700">Advance Paid:</span>
            <strong className="text-emerald-950">₹{advanceNum}</strong>
          </div>
          {paidTransactionRef && (
            <div className="flex justify-between">
              <span className="text-emerald-700">Transaction ID:</span>
              <span className="font-mono text-emerald-900">{paidTransactionRef}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold">
            <span className="text-emerald-800">Remaining Balance on Pickup:</span>
            <span className="text-slate-900">₹{remainingBalance}</span>
          </div>
        </div>
      </div>
    );
  }

  // 3. If Booking is CONFIRMED but advance amount is zero/not yet set
  if (advanceNum <= 0) {
    return (
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-2xl p-5 text-xs text-blue-900 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1">Advance Payment Status</span>
          <span>
            Your booking is confirmed! Our dispatch team is currently finalizing your advance quote.
            Once set, you will be able to complete your advance payment here.
          </span>
        </div>
      </div>
    );
  }

  // 4. If Booking is CONFIRMED and requires Advance Payment
  const handleInitiatePayment = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/payments/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingRef }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create payment order');
      }

      setOrderData(data.data);
      setShowPaymentModal(true);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Error initiating payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelCheckout = () => {
    setShowPaymentModal(false);
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Booking Confirmed · Ref #{bookingRef}
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Pay Advance to Secure Vehicle
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Advance Due</span>
          <span className="text-lg font-extrabold text-blue-700">₹{advanceNum}</span>
        </div>
      </div>

      {/* Vehicle & Trip Summary */}
      {(vehicleName || pickupLocation || pickupDatetime) && (
        <div className="bg-slate-50 rounded-xl p-3 mb-3 text-xs space-y-1.5 border border-slate-100">
          {vehicleName && (
            <div className="flex items-center gap-1.5 font-semibold text-slate-900">
              <Car className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
              <span>{vehicleName}</span>
            </div>
          )}
          {pickupLocation && dropLocation && (
            <div className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>{pickupLocation} → {dropLocation}</span>
            </div>
          )}
          {pickupDatetime && (
            <div className="flex items-center gap-1.5 text-slate-500">
              <Calendar className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span>
                {new Date(pickupDatetime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Pricing Breakdown */}
      <div className="space-y-1.5 text-xs text-slate-600 mb-4">
        <div className="flex justify-between">
          <span>Total Final Trip Quote:</span>
          <strong className="text-slate-900">₹{finalPriceNum}</strong>
        </div>
        <div className="flex justify-between">
          <span>Advance Payable Now:</span>
          <strong className="text-blue-700">₹{advanceNum}</strong>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Remaining Balance (Collect on trip):</span>
          <span className="font-semibold text-slate-700">₹{remainingBalance}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <button
        onClick={handleInitiatePayment}
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors disabled:opacity-60"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Opening Payment Gateway...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Pay Advance (₹{advanceNum})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </>
        )}
      </button>

      {/* Payment Gateway Checkout Modal */}
      {showPaymentModal && orderData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={handleCancelCheckout}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100"
              aria-label="Close Checkout"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Payment Gateway Checkout
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Booking Ref #{bookingRef} · Advance Deposit
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-6 space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-slate-500">Order Reference:</span>
                <span className="font-mono font-semibold text-slate-900 truncate max-w-[200px]">
                  {orderData.orderId}
                </span>
              </div>
              {vehicleName && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Vehicle:</span>
                  <span className="font-semibold text-slate-800">{vehicleName}</span>
                </div>
              )}
              {pickupLocation && dropLocation && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Route:</span>
                  <span className="font-semibold text-slate-800 truncate max-w-[180px]">
                    {pickupLocation} → {dropLocation}
                  </span>
                </div>
              )}
              <div className="flex justify-between text-sm pt-2 border-t border-slate-200">
                <span className="text-slate-700 font-bold">Advance Payable:</span>
                <span className="font-extrabold text-blue-700">
                  ₹{orderData.amount} INR
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Remaining Balance on Trip:</span>
                <span>₹{remainingBalance}</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={handleCancelCheckout}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancel Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
