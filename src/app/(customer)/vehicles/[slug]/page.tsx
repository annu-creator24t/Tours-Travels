import React from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import prisma from '@/lib/db';
import {
  Users,
  Briefcase,
  Snowflake,
  Fuel,
  ArrowRight,
  Star,
  ShieldCheck,
  CheckCircle2,
  PhoneCall,
  ChevronLeft,
  UserCheck,
  Sparkles,
  MessageCircle,
  Clock,
} from 'lucide-react';
import { companyConfig } from '@/lib/company.config';
import VehicleGallery from '@/components/customer/VehicleGallery';

export const revalidate = 0;

interface VehicleDetailsProps {
  params: {
    slug: string;
  };
}

async function getVehicleDetails(slug: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { reviewDate: 'desc' },
        },
      },
    });
    return vehicle;
  } catch (error) {
    console.error('Error fetching vehicle details:', error);
    return null;
  }
}

export async function generateMetadata({ params }: VehicleDetailsProps) {
  const vehicle = await getVehicleDetails(params.slug);
  if (!vehicle) {
    return { title: 'Vehicle Not Found — Jay Maa Sheetala Tours & Travel' };
  }
  return {
    title: `${vehicle.name} (${vehicle.brand}) — Jay Maa Sheetala Tours & Travel`,
    description: `Book ${vehicle.name} for outstation trips, family tours, and airport transfers. ₹${Number(vehicle.perKmRate)}/km with verified professional drivers.`,
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailsProps) {
  const vehicle = await getVehicleDetails(params.slug);

  if (!vehicle || vehicle.status === 'INACTIVE') {
    notFound();
  }

  const reviewCount = vehicle.reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          vehicle.reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviewCount
        ).toFixed(1)
      : null;

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to Fleet Catalog</span>
          </Link>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span>Home</span>
            <span>/</span>
            <span>Fleet</span>
            <span>/</span>
            <span className="font-semibold text-slate-900">{vehicle.name}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Vehicle Information (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-8">
            {/* Interactive Vehicle Gallery */}
            <VehicleGallery
              name={vehicle.name}
              vehicleType={vehicle.vehicleType}
              isFeatured={vehicle.isFeatured}
              status={vehicle.status}
              images={vehicle.images}
            />

            {/* Vehicle Overview & Specs */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
                      {vehicle.brand}
                    </span>
                    <span className="text-slate-300">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {vehicle.vehicleType}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {vehicle.name}
                  </h1>
                </div>

                {avgRating ? (
                  <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl text-sm font-bold text-amber-900 self-start sm:self-auto shadow-sm">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                    <span>{avgRating} Rating</span>
                    <span className="text-xs text-slate-500 font-normal">
                      ({reviewCount} reviews)
                    </span>
                  </div>
                ) : (
                  <div className="bg-slate-100 border border-slate-200 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-slate-600 self-start sm:self-auto">
                    Verified Fleet Vehicle
                  </div>
                )}
              </div>

              {/* Specifications Matrix */}
              <div className="my-6">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Key Specifications
                </h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                    <Users className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Seating</span>
                    <span className="text-sm font-bold text-slate-900">{vehicle.seatingCapacity} Passengers</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                    <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Luggage</span>
                    <span className="text-sm font-bold text-slate-900">{vehicle.luggageCapacity} Bags</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                    <Snowflake className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">AC & Climate</span>
                    <span className="text-sm font-bold text-slate-900">{vehicle.hasAc ? 'Full AC' : 'Non-AC'}</span>
                  </div>

                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 text-center">
                    <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                    <span className="text-[11px] text-slate-500 block uppercase font-medium">Fuel Type</span>
                    <span className="text-sm font-bold text-slate-900">{vehicle.fuelType}</span>
                  </div>
                </div>
              </div>

              {/* Included Vehicle Features */}
              <div className="pt-2">
                <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                  Comfort & Safety Features
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Deep-cleaned & sanitized before each pickup</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Commercial all-India outstation permit</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Pushback seats with generous legroom space</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Bluetooth / Aux audio entertainment system</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>First-aid kit & emergency safety tools</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Fastag enabled for toll booths</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Driver Quality & Safety Assurance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    Professional Driver Standards
                  </h2>
                  <p className="text-xs text-slate-500">
                    Trips are staffed with experienced, licensed commercial chauffeurs.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-slate-600 pt-2">
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Licensed Drivers</span>
                  <span>Verified commercial transport driver licenses.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Highway & Hill Experts</span>
                  <span>Extensive experience across expressway and tourist routes.</span>
                </div>
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="font-bold text-slate-900 block mb-1">Courteous & Punctual</span>
                  <span>Committed to timely doorstep reporting and polite service.</span>
                </div>
              </div>
            </div>

            {/* Verified Reviews Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Customer Reviews & Feedback
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Real reviews from travelers who booked this vehicle.
                  </p>
                </div>

                <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full text-xs font-semibold border border-emerald-200">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Bookings</span>
                </div>
              </div>

              {vehicle.reviews.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-500 bg-slate-50 rounded-xl border border-slate-100">
                  No public reviews posted yet for this vehicle. Be the first to travel and review!
                </div>
              ) : (
                <div className="space-y-4">
                  {vehicle.reviews.map((rev) => (
                    <div
                      key={rev.id}
                      className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-sm">
                            {rev.authorName}
                          </span>
                          <span className="text-[10px] bg-slate-200 text-slate-700 px-2 py-0.5 rounded font-semibold uppercase">
                            {rev.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3.5 h-3.5 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{rev.reviewText}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Sticky Pricing & Instant Booking Card (Desktop) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm sticky top-24">
              <div className="pb-5 border-b border-slate-100">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block mb-1">
                  Transparent Pricing
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-extrabold text-slate-900">
                    ₹{Number(vehicle.perKmRate)}
                  </span>
                  <span className="text-sm font-semibold text-slate-500">/ km</span>
                </div>
                <div className="text-xs text-slate-600 mt-1.5 font-medium flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  <span>
                    Base Daily Rate: <strong className="text-slate-900">₹{Number(vehicle.baseDayRate)}/day</strong>
                  </span>
                </div>
              </div>

              {/* Pricing Line Items */}
              <div className="py-4 space-y-2.5 text-xs text-slate-600 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Driver Allowance:</span>
                  </span>
                  <span className="font-semibold text-slate-900">Included in final quote</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Tolls, State Tax, Parking:</span>
                  </span>
                  <span className="font-semibold text-slate-900">As per actuals</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Cancellation:</span>
                  </span>
                  <span className="font-semibold text-emerald-600">Free before dispatch</span>
                </div>
              </div>

              {/* Primary Call to Action Buttons */}
              <div className="pt-5 space-y-3">
                <Link
                  href={`/book?vehicle=${vehicle.slug}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl text-center inline-flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all text-xs sm:text-sm"
                >
                  <span>Book {vehicle.name}</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <a
                  href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello Jay Maa Sheetala Tours & Travel, I would like to inquire about booking ${vehicle.name}.`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 px-4 rounded-xl text-center inline-flex items-center justify-center gap-2 shadow-sm transition-colors text-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>WhatsApp Inquiry</span>
                </a>

                <a
                  href={`tel:${companyConfig.phone}`}
                  className="w-full border border-slate-300 hover:bg-slate-50 text-slate-800 font-semibold py-2.5 px-4 rounded-xl text-center inline-flex items-center justify-center gap-2 transition-colors text-xs"
                >
                  <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                  <span>Call {companyConfig.phoneDisplay}</span>
                </a>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 text-center">
                <p className="text-[11px] text-slate-400">
                  {companyConfig.name} • Fast Admin Confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Bottom Floating Action Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 block uppercase font-bold">Rates from</span>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-extrabold text-slate-900">
              ₹{Number(vehicle.perKmRate)}
            </span>
            <span className="text-xs text-slate-500">/ km</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href={`tel:${companyConfig.phone}`}
            className="p-2.5 border border-slate-300 rounded-xl text-slate-700 hover:bg-slate-50"
            title="Call Support"
          >
            <PhoneCall className="w-4 h-4 text-blue-600" />
          </a>
          <Link
            href={`/book?vehicle=${vehicle.slug}`}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-sm inline-flex items-center gap-1.5 transition-colors"
          >
            <span>Book Now</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
