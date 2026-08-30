'use client';

import React, { useState } from 'react';
import Image from 'next/image';
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
  Copy,
  Check,
  QrCode,
  Info,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { upiConfig } from '@/lib/upi.config';

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
  pendingTransactionRef?: string | null;
  hasFailedPayment?: boolean;
  failedReason?: string | null;
  whatsappUrl?: string;
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
  pendingTransactionRef,
  hasFailedPayment = false,
  failedReason,
  whatsappUrl,
}: AdvancePaymentBoxProps) {
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [showUtrForm, setShowUtrForm] = useState(false);
  const [utrInput, setUtrInput] = useState(pendingTransactionRef || '');
  const [customerNotes, setCustomerNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [currentPendingUtr, setCurrentPendingUtr] = useState<string | null>(
    pendingTransactionRef || null
  );

  const finalPriceNum = Number(finalPrice || 0);
  const advanceNum = Number(advanceAmount || 0);
  const remainingBalance = Number(
    balanceAmount !== null && balanceAmount !== undefined
      ? balanceAmount
      : Math.max(0, finalPriceNum - advanceNum)
  );

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiConfig.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2500);
  };

  const handleSubmitUtr = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmed = utrInput.trim();
    if (!trimmed) {
      setErrorMessage('Please enter the 12-digit UTR or Transaction ID from your payment.');
      return;
    }

    if (trimmed.length < 6 || trimmed.length > 35) {
      setErrorMessage('UTR / Transaction ID must be between 6 and 35 characters.');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/payments/submit-utr', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingRef,
          utr: trimmed,
          customerNotes: customerNotes.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit payment reference');
      }

      setSuccessMessage(
        'Payment reference submitted successfully! Our dispatch coordinator will verify the transaction and confirm your booking.'
      );
      setCurrentPendingUtr(trimmed);
      setShowUtrForm(false);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Failed to submit payment reference'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 1. If Booking is still PENDING review
  if (status === 'PENDING') {
    return (
      <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-bold block mb-1">Advance Payment Status</span>
          <span>
            Payment is not enabled yet. Once our operations team reviews your inquiry and confirms
            your trip details with a finalized quote, the advance payment option will be enabled here.
          </span>
        </div>
      </div>
    );
  }

  // 2. If Advance is already PAID & VERIFIED
  if (isAdvancePaid) {
    return (
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 shadow-sm">
        <div className="flex items-center justify-between pb-3 border-b border-emerald-200/70 mb-3">
          <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Advance Payment Verified & Received</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded text-[10px] border border-emerald-300">
              Booking Confirmed
            </span>
            <span className="bg-emerald-600 text-white font-bold px-2.5 py-0.5 rounded-full text-[10px]">
              PAID
            </span>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-emerald-800">Payment Status:</span>
            <strong className="text-emerald-900 font-bold">PAID (Admin Verified)</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-800">Booking Status:</span>
            <strong className="text-emerald-900 font-semibold">{status}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-800">Total Trip Price:</span>
            <span className="font-semibold text-slate-800">₹{finalPriceNum}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-emerald-800">Amount Paid (Advance):</span>
            <strong className="text-emerald-950 font-extrabold text-sm">₹{advanceNum}</strong>
          </div>
          {paidTransactionRef && (
            <div className="flex justify-between text-[11px]">
              <span className="text-emerald-700">Payment Reference / UTR:</span>
              <span className="font-mono text-emerald-900 font-bold">{paidTransactionRef}</span>
            </div>
          )}
          <div className="flex justify-between pt-2 border-t border-emerald-200/80 text-xs">
            <span className="text-emerald-900 font-bold">Remaining Balance (Pay on Trip):</span>
            <strong className="text-slate-900 font-bold">₹{remainingBalance}</strong>
          </div>

          {whatsappUrl && (
            <div className="pt-3 border-t border-emerald-200/80">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
              >
                <span>Share Confirmation on WhatsApp</span>
              </a>
            </div>
          )}
        </div>
      </div>
    );
  }

  // 3. If Booking is CONFIRMED but advance amount is zero/not set
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

  // 4. Confirmed booking awaiting Advance Payment via Manual UPI
  return (
    <div className="bg-white rounded-2xl border-2 border-blue-600/30 p-5 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
            Booking Confirmed · Ref #{bookingRef}
          </span>
          <h3 className="text-sm font-bold text-slate-900">
            Pay Advance Deposit via UPI
          </h3>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 block">Advance Due</span>
          <span className="text-lg font-extrabold text-blue-700">₹{advanceNum}</span>
        </div>
      </div>

      {/* Vehicle & Route Quick Chips */}
      {(vehicleName || pickupLocation || pickupDatetime) && (
        <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 border border-slate-100">
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

      {/* Pricing Summary */}
      <div className="space-y-1.5 text-xs text-slate-600">
        <div className="flex justify-between">
          <span>Total Trip Fare:</span>
          <strong className="text-slate-900">₹{finalPriceNum}</strong>
        </div>
        <div className="flex justify-between">
          <span>Advance Payable Now:</span>
          <strong className="text-blue-700">₹{advanceNum}</strong>
        </div>
        <div className="flex justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-400">
          <span>Remaining Balance (Pay on trip):</span>
          <span className="font-semibold text-slate-700">₹{remainingBalance}</span>
        </div>
      </div>

      {/* Rejection / Failure Notice */}
      {hasFailedPayment && !currentPendingUtr && (
        <div className="bg-rose-50 border border-rose-200 text-rose-900 p-3.5 rounded-xl text-xs flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-bold block">Previous Payment Submission Unverified</span>
            <span className="text-[11px] text-rose-800 block mt-0.5">
              {failedReason ||
                'The previous transaction reference could not be verified in bank records. Please make sure to transfer to the official UPI ID below and enter the correct 12-digit UTR.'}
            </span>
          </div>
        </div>
      )}

      {/* Pending Admin Verification Banner */}
      {currentPendingUtr && !showUtrForm && (
        <div className="bg-amber-50 border border-amber-300 rounded-xl p-4 text-xs text-amber-950 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <span>Payment Proof Submitted · Awaiting Admin Verification</span>
            </div>
            <span className="bg-amber-200 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">
              PENDING
            </span>
          </div>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            Your payment reference has been recorded. Our team is verifying the transaction
            against bank records. Your booking will be confirmed automatically once verified.
          </p>
          <div className="bg-white/80 p-2.5 rounded-lg border border-amber-200/80 flex items-center justify-between text-[11px]">
            <div>
              <span className="text-slate-500 block text-[10px]">Submitted UTR / Ref:</span>
              <strong className="font-mono text-slate-900">{currentPendingUtr}</strong>
            </div>
            <button
              type="button"
              onClick={() => {
                setUtrInput(currentPendingUtr);
                setShowUtrForm(true);
              }}
              className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update UTR</span>
            </button>
          </div>
        </div>
      )}

      {/* Success Notification */}
      {successMessage && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{successMessage}</span>
          </div>
          <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Error Notification */}
      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
          <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* UPI Payment Instructions Card */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-3">
        <div className="flex items-center gap-2 font-bold text-slate-800 pb-2 border-b border-slate-200">
          <QrCode className="w-4 h-4 text-blue-600" />
          <span>Step 1: Pay Advance via UPI App</span>
        </div>

        {/* UPI Details Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
          {/* Left: VPA and Payee Details */}
          <div className="space-y-2">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Payee / Account Name
              </span>
              <strong className="text-slate-900 text-xs block">
                {upiConfig.displayName}
              </strong>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Official UPI ID (VPA)
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <code className="bg-white border border-slate-300 font-mono font-bold text-blue-700 px-2.5 py-1.5 rounded-lg text-xs select-all">
                  {upiConfig.upiId}
                </code>
                <button
                  type="button"
                  onClick={handleCopyUpi}
                  className="bg-white hover:bg-slate-100 border border-slate-300 text-slate-700 p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors"
                  title="Copy UPI ID"
                >
                  {copiedUpi ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span className="text-[10px] text-emerald-700">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-500" />
                      <span className="text-[10px]">Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Exact Advance Amount
              </span>
              <strong className="text-blue-700 text-sm font-extrabold">
                ₹{advanceNum} INR
              </strong>
            </div>
          </div>

          {/* Right: Placeholder QR Box */}
          <div className="flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-slate-200 text-center">
            <div className="relative w-36 h-36 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shadow-xs mb-1">
              <Image
                src={upiConfig.qrCodeImageUrl}
                alt="UPI QR Code Placeholder"
                fill
                sizes="144px"
                className="object-contain"
                unoptimized
              />
              <div className="absolute inset-x-0 bottom-0 bg-slate-900/80 text-white text-[9px] font-bold py-0.5 tracking-wider uppercase">
                Placeholder QR
              </div>
            </div>
            <span className="text-[10px] text-slate-400 font-medium">
              Demo QR Code · Jay Maa Sheetala
            </span>
          </div>
        </div>

        {/* Security & Verification Disclaimer */}
        <div className="bg-blue-50/70 border border-blue-200/70 p-2.5 rounded-xl text-[11px] text-blue-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <span>
            <strong>Manual Verification:</strong> After transferring ₹{advanceNum}, enter your 12-digit UTR number below. Our team verifies all transactions manually before confirming vehicle reservation.
          </span>
        </div>
      </div>

      {/* Step 2: "I Have Paid" Action or UTR Form */}
      {!showUtrForm && !currentPendingUtr && (
        <button
          type="button"
          onClick={() => setShowUtrForm(true)}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-colors"
        >
          <CreditCard className="w-4 h-4" />
          <span>I Have Paid · Enter UTR Reference</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      )}

      {/* UTR Input Form */}
      {(showUtrForm || (!currentPendingUtr && showUtrForm)) && (
        <form
          onSubmit={handleSubmitUtr}
          className="bg-slate-50 rounded-2xl p-4 border-2 border-blue-500/40 text-xs space-y-3 animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <span className="font-bold text-slate-900 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-blue-600" />
              <span>Step 2: Submit Payment Proof (UTR Number)</span>
            </span>
            {currentPendingUtr && (
              <button
                type="button"
                onClick={() => setShowUtrForm(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div>
            <label className="block font-bold text-slate-800 mb-1">
              UTR / Transaction Reference ID *
            </label>
            <input
              type="text"
              required
              value={utrInput}
              onChange={(e) => setUtrInput(e.target.value.toUpperCase())}
              placeholder="e.g. 423589102938 (12-digit UTR from UPI app)"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white font-mono font-bold text-xs uppercase"
              maxLength={35}
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Found on your GPay / PhonePe / Paytm / BHIM payment success receipt.
            </span>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Optional Note / Remitter Name
            </label>
            <input
              type="text"
              value={customerNotes}
              onChange={(e) => setCustomerNotes(e.target.value)}
              placeholder="e.g. Paid via Ramesh GPay"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-xs"
              maxLength={200}
            />
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            {currentPendingUtr && (
              <button
                type="button"
                onClick={() => setShowUtrForm(false)}
                className="px-3 py-2 border border-slate-300 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm transition-colors"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Submitting Proof...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Submit Payment Proof</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
