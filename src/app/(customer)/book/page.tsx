'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  User,
  Phone,
  Mail,
  MapPin,
  Car,
  Users,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  ArrowRight,
  ShieldCheck,
  Clock,
  Copy,
  Check,
  MessageCircle,
  PhoneCall,
} from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

interface VehicleOption {
  id: string;
  slug: string;
  name: string;
  brand: string;
  vehicleType: string;
  seatingCapacity: number;
  perKmRate: string | number;
  baseDayRate: string | number;
}

interface SubmittedBookingData {
  bookingRef: string;
  status: string;
  customerName: string;
  customerPhone: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: string;
  returnDatetime?: string | null;
  tripType: string;
  passengerCount: number;
  vehicle?: { name: string; brand: string } | null;
}

function BookingFormContent() {
  const searchParams = useSearchParams();
  const preSelectedSlug = searchParams.get('vehicle');

  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true);

  // Form State
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    pickupLocation: '',
    dropLocation: '',
    pickupDatetime: '',
    returnDatetime: '',
    tripType: 'ONE_WAY',
    passengerCount: 2,
    vehicleId: '',
    customerNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submittedBooking, setSubmittedBooking] =
    useState<SubmittedBookingData | null>(null);
  const [copiedRef, setCopiedRef] = useState(false);

  // Fetch available vehicles for the selector dropdown
  useEffect(() => {
    async function loadVehicles() {
      try {
        const res = await fetch('/api/vehicles');
        const data = await res.json();
        if (res.ok && data.success) {
          const list: VehicleOption[] = data.data || [];
          setVehicles(list);

          // If preselected slug is provided in URL, match and select
          if (preSelectedSlug) {
            const matched = list.find(
              (v) => v.slug === preSelectedSlug || v.id === preSelectedSlug
            );
            if (matched) {
              setFormData((prev) => ({ ...prev, vehicleId: matched.id }));
            }
          }
        }
      } catch (err) {
        console.error('Error fetching vehicle list:', err);
      } finally {
        setIsLoadingVehicles(false);
      }
    }
    loadVehicles();
  }, [preSelectedSlug]);

  const handleCopyRef = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedRef(true);
    setTimeout(() => setCopiedRef(false), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    // Client-side validations
    if (formData.passengerCount < 1 || formData.passengerCount > 60) {
      setErrorMessage('Passenger count must be between 1 and 60');
      setIsSubmitting(false);
      return;
    }

    if (formData.tripType === 'ROUND_TRIP' && !formData.returnDatetime) {
      setErrorMessage('Please select a return date and time for round trips');
      setIsSubmitting(false);
      return;
    }

    if (
      formData.tripType === 'ROUND_TRIP' &&
      formData.returnDatetime &&
      new Date(formData.returnDatetime) < new Date(formData.pickupDatetime)
    ) {
      setErrorMessage('Return date and time must be after pickup date and time');
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          passengerCount: Number(formData.passengerCount),
          vehicleId: formData.vehicleId || undefined,
          customerEmail: formData.customerEmail || undefined,
          returnDatetime: formData.returnDatetime || undefined,
          customerNotes: formData.customerNotes || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to submit booking request');
      }

      setSubmittedBooking(data.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'An error occurred while booking'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // ----------------------------------------------------
  // SUCCESS CONFIRMATION VIEW
  // ----------------------------------------------------
  if (submittedBooking) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-xl text-center">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block bg-amber-50 text-amber-800 text-xs font-bold px-3 py-1 rounded-full border border-amber-200 uppercase tracking-wider mb-2">
            Status: {submittedBooking.status} (Under Admin Review)
          </span>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Booking Request Received!
          </h1>
          <p className="mt-2 text-sm text-slate-600 max-w-md mx-auto">
            Thank you, <strong>{submittedBooking.customerName}</strong>. Your trip
            inquiry has been registered. Our fleet coordinator will contact you
            shortly to confirm driver allocation and trip quote.
          </p>

          {/* Unique Booking Reference Box */}
          <div className="my-8 bg-slate-50 border-2 border-dashed border-blue-300 rounded-2xl p-6 max-w-md mx-auto text-center">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider block mb-1">
              Your Booking Reference ID
            </span>
            <div className="flex items-center justify-center gap-3">
              <span className="text-2xl sm:text-3xl font-black text-blue-700 tracking-wide">
                {submittedBooking.bookingRef}
              </span>
              <button
                onClick={() => handleCopyRef(submittedBooking.bookingRef)}
                className="p-2 text-slate-500 hover:text-blue-600 hover:bg-white rounded-lg border border-slate-200 transition-all shadow-sm"
                title="Copy Reference"
              >
                {copiedRef ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            <span className="text-[11px] text-slate-400 mt-2 block">
              Save this reference number to check trip status and quote updates.
            </span>
          </div>

          {/* Itinerary Summary Card */}
          <div className="bg-slate-50 rounded-2xl p-6 text-left text-xs text-slate-700 max-w-lg mx-auto space-y-2.5 border border-slate-200 mb-8">
            <h3 className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-2">
              Trip Itinerary Summary
            </h3>
            <div className="flex justify-between">
              <span className="text-slate-500">Trip Type:</span>
              <span className="font-semibold text-slate-900">{submittedBooking.tripType}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pickup Location:</span>
              <span className="font-semibold text-slate-900">{submittedBooking.pickupLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="font-semibold text-slate-900">{submittedBooking.dropLocation}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Pickup Time:</span>
              <span className="font-semibold text-slate-900">
                {new Date(submittedBooking.pickupDatetime).toLocaleString('en-IN', {
                  dateStyle: 'medium',
                  timeStyle: 'short',
                })}
              </span>
            </div>
            {submittedBooking.returnDatetime && (
              <div className="flex justify-between">
                <span className="text-slate-500">Return Time:</span>
                <span className="font-semibold text-slate-900">
                  {new Date(submittedBooking.returnDatetime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-slate-500">Passengers:</span>
              <span className="font-semibold text-slate-900">{submittedBooking.passengerCount} Persons</span>
            </div>
            {submittedBooking.vehicle && (
              <div className="flex justify-between">
                <span className="text-slate-500">Requested Vehicle:</span>
                <span className="font-semibold text-blue-600">
                  {submittedBooking.vehicle.name} ({submittedBooking.vehicle.brand})
                </span>
              </div>
            )}
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/booking/${submittedBooking.bookingRef}`}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-bold px-6 py-3.5 rounded-xl shadow-md transition-colors"
            >
              <span>Track Booking Progress</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <a
              href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                `Hello Jay Maa Sheetala Tours & Travel, I have submitted booking inquiry ref: ${submittedBooking.bookingRef}. Please confirm.`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold px-6 py-3.5 rounded-xl shadow-sm transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Admin</span>
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // BOOKING REQUEST FORM VIEW
  // ----------------------------------------------------
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-10">
        <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-200/60">
          <ShieldCheck className="w-4 h-4 text-blue-600" />
          <span>Instant Inquiry & Quick Confirmation</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Book Your Outstation Journey
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          Submit your travel dates and route. We will review vehicle availability
          and provide an exact transparent quote.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3.5 rounded-2xl text-xs flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm">
        <form onSubmit={handleSubmit} className="space-y-8 text-xs">
          {/* Section 1: Trip Route & Type */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>1. Trip Route & Schedule</span>
            </h2>

            {/* Trip Type Selector */}
            <div className="grid grid-cols-3 gap-3 mb-5">
              {[
                { value: 'ONE_WAY', label: 'One Way Drop' },
                { value: 'ROUND_TRIP', label: 'Round Trip' },
                { value: 'LOCAL_RENTAL', label: 'Local City Tour' },
              ].map((t) => (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, tripType: t.value })}
                  className={`py-3 px-3 rounded-xl border text-center font-bold transition-all ${
                    formData.tripType === t.value
                      ? 'bg-blue-50 text-blue-700 border-blue-600 ring-2 ring-blue-600/20'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Pickup Location & Landmark *
                </label>
                <input
                  type="text"
                  value={formData.pickupLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupLocation: e.target.value })
                  }
                  placeholder="e.g. Terminal 3 Delhi Airport / Connaught Place"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Drop Location / Final Destination *
                </label>
                <input
                  type="text"
                  value={formData.dropLocation}
                  onChange={(e) =>
                    setFormData({ ...formData, dropLocation: e.target.value })
                  }
                  placeholder="e.g. Haridwar / Agra / Jaipur Hotel"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-4">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Pickup Date & Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.pickupDatetime}
                  onChange={(e) =>
                    setFormData({ ...formData, pickupDatetime: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Return Date & Time {formData.tripType === 'ROUND_TRIP' && '*'}
                </label>
                <input
                  type="datetime-local"
                  value={formData.returnDatetime}
                  onChange={(e) =>
                    setFormData({ ...formData, returnDatetime: e.target.value })
                  }
                  required={formData.tripType === 'ROUND_TRIP'}
                  className={`w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs bg-white ${
                    formData.tripType !== 'ROUND_TRIP' && 'opacity-60'
                  }`}
                  disabled={formData.tripType !== 'ROUND_TRIP'}
                />
                {formData.tripType !== 'ROUND_TRIP' && (
                  <span className="text-[10px] text-slate-400 mt-1 block">
                    Only required for Round Trip bookings
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Vehicle & Passengers */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <Car className="w-4 h-4 text-blue-600" />
              <span>2. Vehicle & Group Size</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Select Preferred Fleet Vehicle
                </label>
                <select
                  value={formData.vehicleId}
                  onChange={(e) =>
                    setFormData({ ...formData, vehicleId: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-xs"
                >
                  <option value="">-- Let Admin Recommend Best Fleet --</option>
                  {vehicles.map((v) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.brand}) — {v.vehicleType} ({v.seatingCapacity} Seats, ₹{Number(v.perKmRate)}/km)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Number of Passengers (1 to 60) *
                </label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  value={formData.passengerCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      passengerCount: parseInt(e.target.value, 10) || 1,
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 3: Traveler Contact Details */}
          <div>
            <h2 className="text-sm font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>3. Primary Contact Information</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData({ ...formData, customerName: e.target.value })
                  }
                  placeholder="e.g. Rajesh Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Mobile Number (WhatsApp) *
                </label>
                <input
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData({ ...formData, customerPhone: e.target.value })
                  }
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-800 mb-1.5">
                  Email Address (Optional)
                </label>
                <input
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) =>
                    setFormData({ ...formData, customerEmail: e.target.value })
                  }
                  placeholder="name@example.com"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-semibold text-slate-800 mb-1.5">
                Special Requests or Notes (Optional)
              </label>
              <textarea
                rows={3}
                value={formData.customerNotes}
                onChange={(e) =>
                  setFormData({ ...formData, customerNotes: e.target.value })
                }
                placeholder="Mention flight numbers, extra luggage requirements, infant seat request, or intermediate stops..."
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>
          </div>

          {/* Submit Button & Guarantees */}
          <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-500 text-[11px]">
              <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span>Average response time within 15–30 minutes</span>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl shadow-md transition-all text-xs sm:text-sm disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <span>Submit Booking Request</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Quick Help Floating / Footer Box */}
      <div className="mt-8 text-center text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-center gap-4">
        <span>Prefer booking directly via phone?</span>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${companyConfig.phone}`}
            className="font-bold text-blue-600 hover:text-blue-800 inline-flex items-center gap-1"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>{companyConfig.phoneDisplay}</span>
          </a>
          <span className="text-slate-300">•</span>
          <a
            href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-600 hover:text-emerald-800 inline-flex items-center gap-1"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp Support</span>
          </a>
        </div>
      </div>
    </div>
  );
}

export default function BookPage() {
  return (
    <Suspense
      fallback={
        <div className="py-24 text-center text-xs text-slate-400">
          Loading booking form...
        </div>
      }
    >
      <BookingFormContent />
    </Suspense>
  );
}
