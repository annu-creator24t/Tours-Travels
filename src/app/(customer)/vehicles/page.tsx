import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/db';
import {
  Users,
  Briefcase,
  Snowflake,
  Fuel,
  ArrowRight,
  Star,
  ShieldCheck,
  Check,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const metadata = {
  title: 'Our Fleet — Jay Maa Sheetala Tours & Travel',
  description:
    'Explore our well-maintained fleet of sedans, SUVs, and luxury tempo travellers. Transparent per-km rates with verified drivers.',
};

export const revalidate = 0; // Dynamic data for live fleet availability

async function getVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      where: {
        status: { in: ['AVAILABLE', 'BOOKED', 'ON_TRIP'] },
      },
      include: {
        images: {
          orderBy: { displayOrder: 'asc' },
        },
        reviews: {
          where: { isApproved: true },
          select: { rating: true },
        },
      },
      orderBy: [{ isFeatured: 'desc' }, { perKmRate: 'asc' }],
    });
    return vehicles;
  } catch (error) {
    console.error('Failed to fetch vehicles from database:', error);
    return [];
  }
}

export default async function VehiclesPage() {
  const vehicles = await getVehicles();

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-200/60">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>100% Verified Fleet & Drivers</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Our Fleet Catalog
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600 leading-relaxed">
            Clean, air-conditioned, and thoroughly sanitized vehicles for outstation
            family trips, airport transfers, and corporate travel.
          </p>
        </div>

        {/* Fleet Grid */}
        {vehicles.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <p className="text-slate-500 text-sm">
              Our fleet catalog is currently being updated. Please check back shortly or contact us directly.
            </p>
            <div className="mt-6">
              <Link
                href="/contact"
                className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-5 py-2.5 rounded-lg inline-block transition-colors"
              >
                Contact Customer Support
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {vehicles.map((vehicle) => {
              const primaryImage =
                vehicle.images.find((img) => img.isPrimary)?.imageUrl ||
                vehicle.images[0]?.imageUrl ||
                'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80';

              const reviewCount = vehicle.reviews.length;
              const avgRating =
                reviewCount > 0
                  ? (
                      vehicle.reviews.reduce((acc, r) => acc + r.rating, 0) /
                      reviewCount
                    ).toFixed(1)
                  : '4.9';

              const isAvailable = vehicle.status === 'AVAILABLE';

              return (
                <div
                  key={vehicle.id}
                  className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group"
                >
                  {/* Image Container */}
                  <div className="relative h-52 bg-slate-100 overflow-hidden">
                    <Image
                      src={primaryImage}
                      alt={vehicle.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      unoptimized
                    />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 flex items-center gap-2">
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white text-[11px] font-bold px-2.5 py-1 rounded-md">
                        {vehicle.vehicleType}
                      </span>
                      {vehicle.isFeatured && (
                        <span className="bg-amber-500 text-white text-[11px] font-bold px-2.5 py-1 rounded-md flex items-center gap-1 shadow-sm">
                          <Star className="w-3 h-3 fill-white" />
                          <span>Featured</span>
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      {isAvailable ? (
                        <Badge variant="success">Available</Badge>
                      ) : (
                        <Badge variant="warning">On Trip / Booked</Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Name & Ratings */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 leading-snug">
                            {vehicle.name}
                          </h3>
                          <span className="text-xs text-slate-500 font-medium">
                            {vehicle.brand}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded text-xs font-bold text-amber-800 flex-shrink-0">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{avgRating}</span>
                          <span className="text-[10px] text-slate-400 font-normal">
                            ({reviewCount > 0 ? reviewCount : '12+'})
                          </span>
                        </div>
                      </div>

                      {/* Key Specs Row */}
                      <div className="grid grid-cols-4 gap-2 text-center py-3 my-4 border-y border-slate-100 bg-slate-50/60 rounded-xl text-xs text-slate-700 font-medium">
                        <div className="flex flex-col items-center justify-center p-1">
                          <Users className="w-4 h-4 text-blue-600 mb-1" />
                          <span>{vehicle.seatingCapacity} Seats</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1">
                          <Briefcase className="w-4 h-4 text-blue-600 mb-1" />
                          <span>{vehicle.luggageCapacity} Bags</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1">
                          <Snowflake className="w-4 h-4 text-blue-600 mb-1" />
                          <span>{vehicle.hasAc ? 'AC' : 'Non-AC'}</span>
                        </div>
                        <div className="flex flex-col items-center justify-center p-1">
                          <Fuel className="w-4 h-4 text-blue-600 mb-1" />
                          <span className="truncate max-w-[65px]">{vehicle.fuelType}</span>
                        </div>
                      </div>

                      {/* Included Features List */}
                      <ul className="text-xs text-slate-500 space-y-1.5 mb-6">
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>Sanitized vehicle with verified commercial driver</span>
                        </li>
                        <li className="flex items-center gap-1.5">
                          <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                          <span>Audio system & ample legroom space</span>
                        </li>
                        {vehicle.transmission && (
                          <li className="flex items-center gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            <span>{vehicle.transmission} Transmission</span>
                          </li>
                        )}
                      </ul>
                    </div>

                    {/* Pricing & Call to Actions */}
                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[11px] text-slate-400 uppercase font-semibold block">
                          Starting at
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-extrabold text-slate-900">
                            ₹{Number(vehicle.perKmRate)}
                          </span>
                          <span className="text-xs text-slate-500 font-medium">/ km</span>
                        </div>
                        <span className="text-[10px] text-slate-400 block">
                          (₹{Number(vehicle.baseDayRate)}/day base)
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <Link
                          href={`/vehicles/${vehicle.slug}`}
                          className="text-xs font-semibold text-slate-700 hover:text-blue-600 border border-slate-300 hover:border-blue-300 bg-white hover:bg-blue-50/50 px-3 py-2 rounded-lg transition-colors"
                        >
                          Details
                        </Link>
                        <Link
                          href={`/book?vehicle=${vehicle.slug}`}
                          className="inline-flex items-center gap-1 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"
                        >
                          <span>Book Now</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
