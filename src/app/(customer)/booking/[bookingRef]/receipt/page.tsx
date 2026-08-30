import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import {
  Compass,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Car,
  User,
  CreditCard,
  ShieldCheck,
} from 'lucide-react';
import { companyConfig } from '@/lib/company.config';
import PrintReceiptButton from '@/components/customer/PrintReceiptButton';

export const revalidate = 0;

interface ReceiptPageProps {
  params: {
    bookingRef: string;
  };
}

async function getBooking(bookingRef: string) {
  try {
    const booking = await prisma.booking.findUnique({
      where: { bookingRef },
      include: {
        vehicle: true,
        driver: true,
        payments: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
    return booking;
  } catch (error) {
    console.error('Error fetching booking details for receipt:', error);
    return null;
  }
}

export default async function BookingReceiptPage({
  params,
}: ReceiptPageProps) {
  const booking = await getBooking(params.bookingRef);

  if (!booking) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
          <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Receipt Not Found
          </h1>
          <p className="text-xs text-slate-600 mb-6">
            We could not find any booking receipt for reference &quot;
            <strong>{params.bookingRef}</strong>&quot;.
          </p>
          <Link
            href="/booking"
            className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Booking Lookup</span>
          </Link>
        </div>
      </div>
    );
  }

  const isAdvancePaid = booking.payments.some(
    (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
  );
  const paidPayment = booking.payments.find(
    (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
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
    ? `${booking.vehicle.brand} ${booking.vehicle.name} (${booking.vehicle.vehicleType})`
    : 'Vehicle to be allocated';

  const receiptDate = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  const formattedPickupDate = new Date(booking.pickupDatetime).toLocaleString(
    'en-IN',
    {
      dateStyle: 'medium',
      timeStyle: 'short',
    }
  );

  return (
    <div className="bg-slate-100 min-h-screen py-8 sm:py-12 print:bg-white print:py-0 print:min-h-0">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Print Bar (Hidden during actual print) */}
        <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
          <Link
            href={`/booking/${booking.bookingRef}`}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Booking Status</span>
          </Link>

          <div className="flex items-center gap-3">
            <PrintReceiptButton
              label="Print / Download PDF"
              variant="primary"
            />
          </div>
        </div>

        {/* Printable Document Box */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm print:border-0 print:shadow-none print:p-0">
          {/* Header & Letterhead */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-6 border-b-2 border-slate-900 gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2.5">
                <div className="relative w-10 h-10 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-800">
                  <Image
                    src={companyConfig.logoUrl}
                    alt={companyConfig.name}
                    fill
                    sizes="40px"
                    className="object-contain p-0.5"
                    unoptimized
                  />
                </div>
                <h1 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                  {companyConfig.name}
                </h1>
              </div>
              <p className="text-xs text-slate-500 max-w-sm leading-relaxed">
                {companyConfig.address.fullAddress}
              </p>
              <p className="text-xs text-slate-600 font-medium">
                Phone: {companyConfig.phoneDisplay}, {companyConfig.phone2Display} | Email: {companyConfig.email}
              </p>
            </div>

            <div className="sm:text-right space-y-1">
              <span className="inline-block bg-slate-900 text-white font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-1 rounded">
                Booking Receipt
              </span>
              <p className="text-xs text-slate-500 block pt-1">
                Receipt No: <strong className="font-mono text-slate-900">REC-{booking.bookingRef}</strong>
              </p>
              <p className="text-xs text-slate-500 block">
                Issue Date: <strong className="text-slate-900">{receiptDate}</strong>
              </p>
            </div>
          </div>

          {/* Status Banner */}
          <div className="my-6 p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px] uppercase tracking-wider font-bold">
                Booking Reference
              </span>
              <strong className="text-base font-black text-blue-700">
                {booking.bookingRef}
              </strong>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                  Booking Status
                </span>
                <span className="inline-flex items-center gap-1 font-bold text-xs text-slate-900">
                  {booking.status === 'CONFIRMED' && (
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                  <span>{booking.status}</span>
                </span>
              </div>

              <div className="text-right pl-3 border-l border-slate-200">
                <span className="text-slate-400 block text-[10px] uppercase tracking-wider font-bold">
                  Payment Status
                </span>
                <span
                  className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                    isAdvancePaid
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {isAdvancePaid ? 'ADVANCE PAID' : 'PAYMENT PENDING'}
                </span>
              </div>
            </div>
          </div>

          {/* Customer & Trip Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-6 text-xs">
            <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Customer Information</span>
              </h2>
              <div className="space-y-1">
                <p>
                  <span className="text-slate-500">Name: </span>
                  <strong className="text-slate-900">{booking.customerName}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Phone: </span>
                  <strong className="text-slate-900">{booking.customerPhone}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Trip Type: </span>
                  <strong className="text-slate-900">{booking.tripType}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Passengers: </span>
                  <strong className="text-slate-900">{booking.passengerCount} Persons</strong>
                </p>
              </div>
            </div>

            <div className="space-y-2 p-4 rounded-xl bg-slate-50/70 border border-slate-100">
              <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-slate-500" />
                <span>Trip & Vehicle Schedule</span>
              </h2>
              <div className="space-y-1">
                <p>
                  <span className="text-slate-500">Vehicle: </span>
                  <strong className="text-slate-900">{vehicleDisplay}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Pickup Date: </span>
                  <strong className="text-slate-900">{formattedPickupDate}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Pickup: </span>
                  <strong className="text-slate-900">{booking.pickupLocation}</strong>
                </p>
                <p>
                  <span className="text-slate-500">Destination: </span>
                  <strong className="text-slate-900">{booking.dropLocation}</strong>
                </p>
                {booking.driver && (
                  <p>
                    <span className="text-slate-500">Assigned Driver: </span>
                    <strong className="text-slate-900">{booking.driver.name} ({booking.driver.phone})</strong>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Pricing & Balance Table */}
          <div className="my-6">
            <h2 className="font-bold text-slate-900 text-xs uppercase tracking-wider mb-2">
              Payment & Fare Statement
            </h2>
            <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">Description</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Amount (INR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="py-3 px-4 font-medium text-slate-900">
                      Total Final Trip Fare ({booking.pickupLocation} → {booking.dropLocation})
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] font-semibold text-slate-700">Quoted</span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-slate-900">
                      ₹{finalPriceNum}
                    </td>
                  </tr>

                  <tr className="bg-emerald-50/50">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-emerald-900">
                        Advance Deposit Paid
                      </div>
                      {paidPayment?.transactionRef && (
                        <div className="text-[10px] text-emerald-700 font-mono">
                          Ref: {paidPayment.transactionRef}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded">
                        {isAdvancePaid ? 'PAID' : 'PENDING'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right font-bold text-emerald-900">
                      ₹{isAdvancePaid ? advanceAmountNum : 0}
                    </td>
                  </tr>

                  <tr className="bg-slate-50 font-bold">
                    <td className="py-3 px-4 text-slate-900">
                      Remaining Balance Due (To be collected during trip)
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="text-[11px] text-slate-600">On Pickup</span>
                    </td>
                    <td className="py-3 px-4 text-right text-sm font-extrabold text-slate-900">
                      ₹{remainingBalanceNum}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Terms & Footer Note */}
          <div className="pt-4 border-t border-slate-200 text-[11px] text-slate-500 space-y-1.5 leading-relaxed">
            <p className="font-semibold text-slate-700">Terms & Instructions:</p>
            <ul className="list-disc list-inside space-y-0.5 text-[10px]">
              <li>Toll tax, parking, and state permit charges are to be verified per route itinerary.</li>
              <li>Please keep this digital or printed receipt for coordinator and driver verification on pickup.</li>
              <li>For any schedule amendments or queries, contact our 24/7 helplines at {companyConfig.phoneDisplay} or {companyConfig.phone2Display}.</li>
            </ul>
            <div className="pt-3 flex justify-between items-center text-[10px] text-slate-400">
              <span>Authorized Travel Coordinator · {companyConfig.name}</span>
              <span>Computer Generated Booking Receipt</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
