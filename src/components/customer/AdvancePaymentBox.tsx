'use client';

import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

interface AdvancePaymentBoxProps {
  bookingRef: string;
  status: string;
  finalPrice?: number | null;
  advanceAmount?: number | null;
  balanceAmount?: number | null;
  isAdvancePaid: boolean;
  paidTransactionRef?: string | null;
}

// Native browser HMAC-SHA256 helper for client demo test simulation
async function generateClientHmacSha256(message: string, secret: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await window.crypto.subtle.sign('HMAC', key, enc.encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

export default function AdvancePaymentBox({
  bookingRef,
  status,
  finalPrice,
  advanceAmount,
  balanceAmount,
  isAdvancePaid,
  paidTransactionRef,
}: AdvancePaymentBoxProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isPaid, setIsPaid] = useState(isAdvancePaid);
  const [transactionRef, setTransactionRef] = useState(paidTransactionRef);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [orderData, setOrderData] = useState<{
    orderId: string;
    amount: number;
    currency: string;
  } | null>(null);

  const finalPriceNum = Number(finalPrice || 0);
  const advanceNum = Number(advanceAmount || 0);

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
  if (isPaid) {
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
          {transactionRef && (
            <div className="flex justify-between">
              <span className="text-emerald-700">Transaction ID:</span>
              <span className="font-mono text-emerald-900">{transactionRef}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 border-t border-emerald-200/60 font-bold">
            <span className="text-emerald-800">Remaining Balance on Pickup:</span>
            <span className="text-slate-900">
              ₹{Number(balanceAmount || Math.max(0, finalPriceNum - advanceNum))}
            </span>
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

  const handleSimulatePaymentCompletion = async () => {
    if (!orderData) return;
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const simulatedPaymentId = `pay_${Date.now()}`;
      const secret = 'dev_payment_gateway_secret_2026';
      const payload = `${orderData.orderId}|${simulatedPaymentId}`;
      const signature = await generateClientHmacSha256(payload, secret);

      const res = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          orderId: orderData.orderId,
          paymentId: simulatedPaymentId,
          signature,
          rawResponse: { mode: 'UPI_GATEWAY_DEMO' },
        }),
      });

      const verifyData = await res.json();

      if (!res.ok || !verifyData.success) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      setIsPaid(true);
      setTransactionRef(orderData.orderId);
      setShowPaymentModal(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to verify payment'
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-5 shadow-sm">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Booking Confirmed
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
          <span>₹{Math.max(0, finalPriceNum - advanceNum)}</span>
        </div>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-2.5 rounded-lg text-xs flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
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
            <span>Creating Secure Order...</span>
          </>
        ) : (
          <>
            <CreditCard className="w-4 h-4" />
            <span>Proceed to Pay Advance (₹{advanceNum})</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </>
        )}
      </button>

      {/* Payment Gateway Dialog */}
      {showPaymentModal && orderData && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl text-center">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7" />
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-1">
              Complete Advance Payment
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Secure UPI & Card Payment Gateway for Booking #{bookingRef}
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs mb-6 space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Order ID:</span>
                <span className="font-mono font-semibold text-slate-900">
                  {orderData.orderId}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-700 font-bold">Payable Amount:</span>
                <span className="font-extrabold text-blue-700">
                  ₹{orderData.amount} INR
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSimulatePaymentCompletion}
                disabled={isLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Signature with Backend...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Pay ₹{orderData.amount} via UPI / Card</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setShowPaymentModal(false)}
                disabled={isLoading}
                className="w-full border border-slate-300 hover:bg-slate-50 text-slate-600 font-medium py-2 rounded-xl text-xs"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
