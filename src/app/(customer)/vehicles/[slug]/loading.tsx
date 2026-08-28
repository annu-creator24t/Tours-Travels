import React from 'react';

export default function VehicleDetailsLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="h-4 w-32 bg-slate-200 rounded mb-6" />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Gallery & Details (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Gallery Image Skeleton */}
            <div className="h-80 sm:h-96 bg-slate-300 rounded-3xl" />

            {/* Thumbnail Row */}
            <div className="grid grid-cols-4 gap-3">
              <div className="h-20 bg-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-200 rounded-2xl" />
              <div className="h-20 bg-slate-200 rounded-2xl" />
            </div>

            {/* Details Card */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-4">
              <div className="h-8 w-2/3 bg-slate-300 rounded" />
              <div className="h-4 w-1/3 bg-slate-200 rounded" />

              <div className="grid grid-cols-4 gap-3 py-4 border-y border-slate-100 bg-slate-50 rounded-2xl">
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
                <div className="h-10 bg-slate-200 rounded" />
              </div>

              <div className="space-y-2 pt-2">
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-5/6 bg-slate-100 rounded" />
                <div className="h-4 w-4/6 bg-slate-100 rounded" />
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Booking Card (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 space-y-6 shadow-sm">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-slate-200 rounded" />
                <div className="h-10 w-40 bg-slate-300 rounded" />
                <div className="h-3 w-32 bg-slate-200 rounded" />
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100">
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-full bg-slate-100 rounded" />
                <div className="h-4 w-3/4 bg-slate-100 rounded" />
              </div>

              <div className="h-12 w-full bg-blue-600/40 rounded-xl" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
