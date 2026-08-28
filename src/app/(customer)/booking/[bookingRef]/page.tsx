import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import {
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  MessageCircle,
  PhoneCall,
  Sparkles,
  FileText,
  Download,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { companyConfig } from '@/lib/company.config';
import AdvancePaymentBox from '@/components/customer/AdvancePaymentBox';
import BookingTimeline from '@/components/customer/BookingTimeline';


export const revalidate = 0;

interface BookingTrackingPageProps {
  params: {
    bookingRef: string;
  };
}

async function getBooking(bookingRef: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        vehicle: {
          include: { images: true },
        },
        driver: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return booking;
  } catch (error) {
    console.error('Error fetching booking details:', error);
    return null;
  }
}

export default async function BookingStatusPage({
  params,
}: BookingTrackingPageProps) {
  const booking = await getBooking(params.bookingRef);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 sm:p-10 shadow-sm">
          <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Booking Reference Not Found
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mb-6">
            We couldn&apos;t find any booking request with reference &quot;
            <strong>{params.bookingRef}</strong>&quot;. Please check the reference
            number or contact support.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              href="/book"
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Submit New Booking
            </Link>
            <a
              href={`tel:${companyConfig.phone}`}
              className="border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
            >
              Call Support
            </a>
          </div>
        </div>
      </div>
    );
  }

  const primaryImage =
    booking.vehicle?.images.find((img) => img.isPrimary)?.imageUrl ||
    booking.vehicle?.images[0]?.imageUrl;

  const isAdvancePaid = booking.payments.some(
    (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
  );
  const hasFailedPayment =
    !isAdvancePaid && booking.payments.some((p) => p.status === 'FAILED');
  const hasAdvanceRequired = Boolean(
    booking.advanceAmount && Number(booking.advanceAmount) > 0
  );
  const finalPriceNum = Number(
    booking.finalPrice || booking.estimatedPrice || 0
  );
  const advanceAmountNum = Number(booking.advanceAmount || 0);
  const remainingBalanceNum = Number(
    booking.balanceAmount !== null && booking.balanceAmount !== undefined
      ? booking.balanceAmount
      : Math.max(0, finalPriceNum - (isAdvancePaid ? advanceAmountNum : 0))
  );


  const vehicleDisplay = booking.vehicle
    ? `${booking.vehicle.brand} ${booking.vehicle.name}`
    : 'Vehicle Allocated';

  const formattedPickupDate = new Date(booking.pickupDatetime).toLocaleString(
    'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  const whatsappNumber = companyConfig.whatsapp.replace(/[^0-9]/g, '');

  const whatsappMessage =
    booking.status === 'CONFIRMED' || booking.status === 'COMPLETED'
      ? `Hello ${companyConfig.name},\n` +
        `My booking reference is ${booking.bookingRef}.\n` +
        `Customer: ${booking.customerName}\n` +
        `Vehicle: ${vehicleDisplay}\n` +
        `Route: ${booking.pickupLocation} → ${booking.dropLocation}\n` +
        `Date: ${formattedPickupDate}\n` +
        `Total Price: ₹${finalPriceNum}\n` +
        `Advance Paid: ₹${isAdvancePaid ? advanceAmountNum : 0}${isAdvancePaid ? ' (PAID)' : ''}\n` +
        `Remaining Balance: ₹${remainingBalanceNum}\n` +
        `Booking Status: ${booking.status}`
      : `Hello ${companyConfig.name},\n` +
        `I have submitted a booking inquiry.\n` +
        `Booking Ref: ${booking.bookingRef}\n` +
        `Customer: ${booking.customerName}\n` +
        `Vehicle: ${vehicleDisplay}\n` +
        `Route: ${booking.pickupLocation} → ${booking.dropLocation}\n` +
        `Date: ${formattedPickupDate}\n` +
        `Booking Status: Waiting for Confirmation`;

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(
    whatsappMessage
  )}`;



  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
        </div>

        {/* Main Status Container */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header & Status Ribbon */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Trip Booking Reference
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-blue-700 tracking-tight">
                {booking.bookingRef}
              </h1>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {booking.status === 'PENDING' && (
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 font-bold px-3.5 py-1.5 rounded-full text-xs">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Waiting for Confirmation</span>
                </span>
              )}
              {booking.status === 'CONFIRMED' && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold px-3.5 py-1.5 rounded-full text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Booking Confirmed</span>
                </span>
              )}
              {booking.status === 'COMPLETED' && (
                <Badge variant="success">Trip Completed</Badge>
              )}
              {booking.status === 'CANCELLED' && (
                <Badge variant="danger">Trip Cancelled</Badge>
              )}
              {booking.status === 'REJECTED' && (
                <Badge variant="danger">Request Declined</Badge>
              )}

              {(booking.status === 'CONFIRMED' || booking.status === 'COMPLETED') && (
                <Link
                  href={`/booking/${booking.bookingRef}/receipt`}
                  className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold px-3.5 py-1.5 rounded-full text-xs transition-colors shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Receipt</span>
                </Link>
              )}
            </div>
          </div>

          {/* Prominent Success Hero State for Confirmed / Paid Bookings */}
          {booking.status === 'CONFIRMED' && isAdvancePaid && (
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-5 text-white shadow-md">
              <div className="flex items-center gap-2 font-black text-base sm:text-lg mb-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                <span>Booking Confirmed & Advance Payment Verified!</span>
              </div>
              <p className="text-xs text-emerald-100 mb-4 leading-relaxed">
                Thank you, <strong>{booking.customerName}</strong>. Your advance deposit of{' '}
                <strong>₹{advanceAmountNum}</strong> has been received. Your vehicle is reserved for your trip from{' '}
                <strong>{booking.pickupLocation}</strong> to <strong>{booking.dropLocation}</strong>.
              </p>

              {/* Quick Key Summary Chips */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs mb-3">
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-[10px] text-emerald-200 block">Customer</span>
                  <span className="font-bold truncate block">{booking.customerName}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-[10px] text-emerald-200 block">Total Quote</span>
                  <span className="font-bold block">₹{finalPriceNum}</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-[10px] text-emerald-200 block">Advance Paid</span>
                  <span className="font-bold text-emerald-200 block">₹{advanceAmountNum} (PAID)</span>
                </div>
                <div className="bg-white/10 rounded-xl p-2.5 backdrop-blur-xs">
                  <span className="text-[10px] text-emerald-200 block">Balance on Trip</span>
                  <span className="font-bold block">₹{remainingBalanceNum}</span>
                </div>
              </div>

              {/* Action Buttons: WhatsApp and Download Receipt */}
              <div className="pt-3 border-t border-emerald-500/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                <span className="text-xs text-emerald-100">
                  Manage & share your booking documentation:
                </span>
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
                  <Link
                    href={`/booking/${booking.bookingRef}/receipt`}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 bg-white/20 hover:bg-white/30 text-white border border-white/30 font-bold px-3.5 py-2 rounded-xl text-xs backdrop-blur-xs transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Receipt</span>
                  </Link>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-white hover:bg-emerald-50 text-emerald-800 font-bold px-4 py-2 rounded-xl text-xs shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-600" />
                    <span>Share on WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}



          {/* Pending Notice */}
          {booking.status === 'PENDING' && (
            <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 text-xs text-amber-900 flex items-start gap-3">
              <Clock className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Waiting for confirmation</span>
                <span className="leading-relaxed">
                  Our operations coordinator is reviewing vehicle and driver allocation for your requested route from{' '}
                  <strong>{booking.pickupLocation}</strong> to <strong>{booking.dropLocation}</strong> on{' '}
                  <strong>
                    {new Date(booking.pickupDatetime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>. We will reach out shortly with finalized quotation.
                </span>
              </div>
            </div>
          )}

          {/* Completed Notice */}
          {booking.status === 'COMPLETED' && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-xs text-emerald-900 flex items-start gap-3">
              <Sparkles className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block mb-1">Trip Successfully Concluded</span>
                <span>
                  This trip has concluded. Thank you for choosing {companyConfig.name}!
                </span>
              </div>
            </div>
          )}

          {/* Visual Lifecycle Timeline */}
          <BookingTimeline
            status={booking.status}
            isAdvancePaid={isAdvancePaid}
            hasAdvanceRequired={hasAdvanceRequired}
          />

          {/* Advance Payment Section */}
          <AdvancePaymentBox
            bookingRef={booking.bookingRef}
            status={booking.status}
            vehicleName={
              booking.vehicle
                ? `${booking.vehicle.brand} ${booking.vehicle.name}`
                : null
            }
            pickupLocation={booking.pickupLocation}
            dropLocation={booking.dropLocation}
            pickupDatetime={booking.pickupDatetime}
            finalPrice={finalPriceNum}
            advanceAmount={advanceAmountNum}
            balanceAmount={remainingBalanceNum}
            isAdvancePaid={isAdvancePaid}
            hasFailedPayment={hasFailedPayment}
            whatsappUrl={whatsappUrl}
            paidTransactionRef={
              booking.payments.find(
                (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
              )?.transactionRef
            }
          />


          {/* Trip Details Grid */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
              Trip & Passenger Details
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-700 bg-slate-50 p-5 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block mb-0.5">Primary Traveler:</span>
                <strong className="text-slate-900 text-sm">{booking.customerName}</strong>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Contact Phone:</span>
                <strong className="text-slate-900">{booking.customerPhone}</strong>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Pickup Location:</span>
                <strong className="text-slate-900">{booking.pickupLocation}</strong>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Destination / Drop:</span>
                <strong className="text-slate-900">{booking.dropLocation}</strong>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Pickup Schedule:</span>
                <strong className="text-slate-900">
                  {new Date(booking.pickupDatetime).toLocaleString('en-IN', {
                    dateStyle: 'medium',
                    timeStyle: 'short',
                  })}
                </strong>
              </div>

              {booking.returnDatetime && (
                <div>
                  <span className="text-slate-400 block mb-0.5">Return Schedule:</span>
                  <strong className="text-slate-900">
                    {new Date(booking.returnDatetime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
              )}

              <div>
                <span className="text-slate-400 block mb-0.5">Trip Type & Group:</span>
                <strong className="text-slate-900">
                  {booking.tripType} · {booking.passengerCount} Passengers
                </strong>
              </div>

              <div>
                <span className="text-slate-400 block mb-0.5">Booking Status:</span>
                <strong className="text-slate-900 font-bold">{booking.status}</strong>
              </div>

              {booking.customerNotes && (
                <div className="sm:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Traveler Notes:</span>
                  <p className="italic text-slate-600">{booking.customerNotes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Allocated Vehicle & Driver */}
          {(booking.vehicle || booking.driver) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {booking.vehicle && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Allocated Vehicle
                  </span>
                  <div className="flex items-center gap-3">
                    {primaryImage && (
                      <div className="w-14 h-12 rounded-lg bg-slate-100 overflow-hidden relative flex-shrink-0">
                        <Image
                          src={primaryImage}
                          alt={booking.vehicle.name}
                          fill
                          sizes="60px"
                          className="object-cover"
                          unoptimized
                        />
                      </div>
                    )}
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {booking.vehicle.name}
                      </h4>
                      <span className="text-slate-500 text-[11px]">
                        {booking.vehicle.brand} · {booking.vehicle.vehicleType}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {booking.driver && (
                <div className="p-4 rounded-2xl bg-white border border-slate-200 text-xs">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Assigned Driver
                  </span>
                  <h4 className="font-bold text-slate-900 text-sm">
                    {booking.driver.name}
                  </h4>
                  <span className="text-slate-500 block">
                    Phone: <strong>{booking.driver.phone}</strong>
                  </span>
                  <span className="text-slate-400 text-[11px]">
                    Experience: {booking.driver.experienceYears} Years
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Quick Coordinator Contact */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <span className="text-slate-500">Have questions regarding this trip?</span>
            <div className="flex items-center gap-3">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Coordinator</span>
              </a>
              <a

                href={`tel:${companyConfig.phone}`}
                className="inline-flex items-center gap-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold px-4 py-2 rounded-xl transition-colors"
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Call Us</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
