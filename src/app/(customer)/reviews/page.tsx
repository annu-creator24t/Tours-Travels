import React from 'react';
import prisma from '@/lib/db';
import { Star, ShieldCheck, MessageCircle, Plus } from 'lucide-react';
import ReviewSourceBadge from '@/components/customer/ReviewSourceBadge';
import type { Metadata } from 'next';
import { companyConfig } from '@/lib/company.config';

export const metadata: Metadata = {
  title: `Customer Reviews & Justdial Ratings — ${companyConfig.name}`,
  description: `Read real traveler reviews and verified Justdial ratings for ${companyConfig.name} outstation and fleet rental services.`,
  alternates: {
    canonical: '/reviews',
  },
  openGraph: {
    type: 'website',
    locale: 'en_IN',
    url: '/reviews',
    siteName: companyConfig.name,
    title: `Customer Reviews & Justdial Ratings — ${companyConfig.name}`,
    description: `Read real traveler reviews and verified Justdial ratings for ${companyConfig.name} outstation and fleet rental services.`,
    images: [
      {
        url: '/images/hero-fleet.jpg',
        width: 1200,
        height: 630,
        alt: `${companyConfig.name} Customer Reviews`,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Customer Reviews & Justdial Ratings — ${companyConfig.name}`,
    description: `Read real traveler reviews and verified Justdial ratings for ${companyConfig.name} outstation and fleet rental services.`,
    images: ['/images/hero-fleet.jpg'],
  },
};

export const revalidate = 0;

async function getApprovedReviews() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      include: {
        vehicle: {
          select: { name: true, brand: true, slug: true },
        },
      },
      orderBy: { reviewDate: 'desc' },
    });
    return reviews;
  } catch (error) {
    console.error('Error fetching reviews from database:', error);
    return [];
  }
}

export default async function ReviewsPage() {
  const reviews = await getApprovedReviews();

  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews
        ).toFixed(1)
      : null;

  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3.5 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-4 border border-blue-200/60">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Verified Customer Reviews</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Customer Ratings & Reviews
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-600">
            Discover real experiences from travelers across outstation trips,
            family vacations, and airport rentals.
          </p>
        </div>

        {/* Rating Overview Summary Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center text-center md:text-left divide-y md:divide-y-0 md:divide-x divide-slate-100">
            {/* Overall Score */}
            <div className="flex flex-col items-center md:items-start justify-center pb-4 md:pb-0">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Overall Traveler Score
              </span>
              {totalReviews > 0 && avgRating ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900">
                      {avgRating}
                    </span>
                    <span className="text-sm font-semibold text-slate-400">/ 5.0</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${
                          i < Math.round(Number(avgRating))
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-slate-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs text-slate-500 font-medium ml-1">
                      ({totalReviews} verified {totalReviews === 1 ? 'review' : 'reviews'})
                    </span>
                  </div>
                </>
              ) : (
                <div className="mt-0.5">
                  <span className="text-xl sm:text-2xl font-bold text-slate-800 block">
                    No reviews yet
                  </span>
                  <p className="text-xs text-slate-500 mt-1">
                    Be the first to share your experience
                  </p>
                </div>
              )}
            </div>

            {/* Justdial Reviews CTA */}
            <div className="flex flex-col items-center md:items-start justify-center py-4 md:py-0 md:px-6 space-y-2 text-center md:text-left">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                Justdial Reviews
              </span>
              <p className="text-xs text-slate-600 leading-relaxed">
                Read our customer feedback directly on Justdial.
              </p>
              <a
                href={companyConfig.justdialUrl || 'https://jsdl.in/RSL-YYJ1787846600'}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors shadow-sm mt-1"
                title="View Reviews on Justdial"
              >
                <span>View Reviews on Justdial</span>
                <span aria-hidden="true">&rarr;</span>
              </a>
            </div>

            {/* Direct WhatsApp / Help Action */}
            <div className="flex flex-col items-center md:items-end justify-center pt-4 md:pt-0 md:pl-6 text-center md:text-right">
              <span className="text-xs text-slate-500 mb-2">Have you traveled with us?</span>
              <a
                href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  'Hello Jay Maa Sheetala Tours & Travel, I would like to share my trip feedback.'
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-sm transition-colors"
              >
                <MessageCircle className="w-4 h-4 text-emerald-400" />
                <span>Share Feedback on WhatsApp</span>
              </a>
            </div>
          </div>
        </div>

        {/* Reviews Grid */}
        {reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 max-w-md mx-auto">
            <p className="text-slate-500 text-sm">
              No customer reviews published yet. Be the first to share your journey!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((review) => {
              const formattedDate = new Date(review.reviewDate).toLocaleDateString(
                'en-IN',
                {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                }
              );

              return (
                <div
                  key={review.id}
                  className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Rating & Source Badge */}
                    <div className="flex items-center justify-between mb-4 gap-2">
                      <div className="flex items-center gap-1 text-amber-500">
                        {Array.from({ length: review.rating }).map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500" />
                        ))}
                      </div>
                      <ReviewSourceBadge
                        source={review.source}
                        sourceUrl={review.sourceUrl}
                      />
                    </div>

                    {/* Review Text */}
                    <p className="text-sm text-slate-700 leading-relaxed italic mb-5">
                      &ldquo;{review.reviewText}&rdquo;
                    </p>

                    {/* Vehicle Tag if specific */}
                    {review.vehicle && (
                      <div className="inline-block bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-md mb-4">
                        Vehicle: {review.vehicle.name} ({review.vehicle.brand})
                      </div>
                    )}
                  </div>

                  {/* Author & Formatted Date */}
                  <div className="flex items-center justify-between text-xs text-slate-500 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                        {review.authorName.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-bold text-slate-900 text-xs">
                        {review.authorName}
                      </span>
                    </div>
                    <span className="text-slate-400 font-medium">{formattedDate}</span>
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
