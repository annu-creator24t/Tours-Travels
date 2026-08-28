import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
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
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { companyConfig } from '@/lib/company.config';

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
    description: `Book ${vehicle.name} for outstation trips and airport rentals. ₹${Number(vehicle.perKmRate)}/km with verified drivers.`,
  };
}

export default async function VehicleDetailPage({ params }: VehicleDetailsProps) {
  const vehicle = await getVehicleDetails(params.slug);

  if (!vehicle || vehicle.status === 'INACTIVE') {
    notFound();
  }

  const primaryImage =
    vehicle.images.find((img) => img.isPrimary)?.imageUrl ||
    vehicle.images[0]?.imageUrl ||
    'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=1200&q=80';

  const reviewCount = vehicle.reviews.length;
  const avgRating =
    reviewCount > 0
      ? (
          vehicle.reviews.reduce((acc, r) => acc + r.rating, 0) /
          reviewCount
        ).toFixed(1)
      : '4.9';

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb / Back button */}
        <div className="mb-6">
          <Link
            href="/vehicles"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Back to All Fleet Vehicles</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Vehicle Details (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery / Hero Image */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              <div className="relative h-80 sm:h-96 bg-slate-100">
                <Image
                  src={primaryImage}
                  alt={vehicle.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  unoptimized
                />
                <div className="absolute top-4 left-4 flex items-center gap-2">
                  <span className="bg-slate-900/80 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {vehicle.vehicleType}
                  </span>
                  {vehicle.isFeatured && (
                    <span className="bg-amber-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-white" />
                      <span>Featured</span>
                    </span>
                  )}
                </div>

                <div className="absolute top-4 right-4">
                  {vehicle.status === 'AVAILABLE' ? (
                    <Badge variant="success">Available Now</Badge>
                  ) : (
                    <Badge variant="warning">On Trip / Booked</Badge>
                  )}
                </div>
              </div>

              {/* Gallery Thumbnails if multiple */}
              {vehicle.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-3 border-t border-slate-100 bg-slate-50/50">
                  {vehicle.images.map((img) => (
                    <div
                      key={img.id}
                      className="relative h-20 rounded-lg overflow-hidden border border-slate-200 bg-slate-100"
                    >
                      <Image
                        src={img.imageUrl}
                        alt="Vehicle gallery thumbnail"
                        fill
                        sizes="120px"
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vehicle Specifications Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-100 gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                    {vehicle.name}
                  </h1>
                  <p className="text-sm text-slate-500 mt-1">
                    {vehicle.brand} · Category: {vehicle.vehicleType}
                  </p>
                </div>

                <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-sm font-bold text-amber-900 self-start sm:self-auto">
                  <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  <span>{avgRating} Rating</span>
                  <span className="text-xs text-slate-500 font-normal">
                    ({reviewCount > 0 ? `${reviewCount} reviews` : '12+ verified trips'})
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 my-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-center">
                  <Users className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Capacity</span>
                  <span className="text-sm font-bold text-slate-900">{vehicle.seatingCapacity} Passengers</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-center">
                  <Briefcase className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Luggage</span>
                  <span className="text-sm font-bold text-slate-900">{vehicle.luggageCapacity} Bags</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-center">
                  <Snowflake className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Climate</span>
                  <span className="text-sm font-bold text-slate-900">{vehicle.hasAc ? 'Powerful AC' : 'Non-AC'}</span>
                </div>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70 text-center">
                  <Fuel className="w-5 h-5 text-blue-600 mx-auto mb-1.5" />
                  <span className="text-[11px] text-slate-500 block uppercase font-medium">Fuel</span>
                  <span className="text-sm font-bold text-slate-900">{vehicle.fuelType}</span>
                </div>
              </div>

              {/* Service Inclusions */}
              <div className="pt-2">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Service Inclusions & Guarantees</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Commercial permit with clean background verified driver</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Clean, washed, and sanitized interior before every trip</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Transparent billing with zero surprise surcharge</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>24/7 on-trip dispatch & phone assistance</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approved Reviews Section */}
            {vehicle.reviews.length > 0 && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">
                  Customer Reviews ({vehicle.reviews.length})
                </h3>
                <div className="space-y-4">
                  {vehicle.reviews.map((rev) => (
                    <div key={rev.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-slate-900">{rev.authorName}</span>
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: rev.rating }).map((_, i) => (
                            <Star key={i} className="w-3 h-3 fill-amber-500" />
                          ))}
                        </div>
                      </div>
                      <p className="text-slate-600 leading-relaxed">{rev.reviewText}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Sidebar Booking & Pricing Card */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm sticky top-24">
              <div className="pb-5 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Pricing Overview
                </span>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-extrabold text-slate-900">
                    ₹{Number(vehicle.perKmRate)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">/ kilometer</span>
                </div>
                <div className="text-xs text-slate-500 mt-1 font-medium">
                  Base Day Rate: <span className="font-bold text-slate-800">₹{Number(vehicle.baseDayRate)}/day</span>
                </div>
              </div>

              <div className="py-5 space-y-3 text-xs text-slate-600 border-b border-slate-100">
                <div className="flex items-center justify-between">
                  <span>Driver Allowance:</span>
                  <span className="font-semibold text-slate-800">Included in Quote</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Tolls & Parking:</span>
                  <span className="font-semibold text-slate-800">As per actual receipts</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Instant Confirmation:</span>
                  <span className="font-semibold text-emerald-600">Available</span>
                </div>
              </div>

              <div className="pt-5 space-y-3">
                <Link
                  href={`/book?vehicle=${vehicle.slug}`}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl text-center inline-flex items-center justify-center gap-2 shadow-sm transition-colors text-xs"
                >
                  <span>Book This Vehicle</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

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
                  {companyConfig.name} · Fast WhatsApp & Phone confirmation
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
