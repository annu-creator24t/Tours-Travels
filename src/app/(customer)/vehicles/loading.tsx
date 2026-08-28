import React from 'react';

export default function VehiclesLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="text-center max-w-2xl mx-auto mb-12 animate-pulse">
          <div className="h-6 w-48 bg-slate-200 rounded-full mx-auto mb-4" />
          <div className="h-10 w-72 bg-slate-300 rounded-xl mx-auto mb-3" />
          <div className="h-4 w-96 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Fleet Grid Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs animate-pulse flex flex-col"
            >
              {/* Image Skeleton */}
              <div className="h-52 bg-slate-200 relative" />

              {/* Content Skeleton */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex justify-between items-start mb-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="h-5 w-3/4 bg-slate-300 rounded" />
                      <div className="h-3.5 w-1/3 bg-slate-200 rounded" />
                    </div>
                    <div className="h-5 w-12 bg-slate-200 rounded" />
                  </div>

                  {/* Specs Grid Skeleton */}
                  <div className="grid grid-cols-4 gap-2 py-3 my-4 border-y border-slate-100 bg-slate-50 rounded-xl">
                    <div className="h-8 bg-slate-200/80 rounded" />
                    <div className="h-8 bg-slate-200/80 rounded" />
                    <div className="h-8 bg-slate-200/80 rounded" />
                    <div className="h-8 bg-slate-200/80 rounded" />
                  </div>

                  {/* Features Skeleton */}
                  <div className="space-y-2 mb-4">
                    <div className="h-3 w-5/6 bg-slate-100 rounded" />
                    <div className="h-3 w-4/6 bg-slate-100 rounded" />
                  </div>
                </div>

                {/* Pricing & CTA Skeleton */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="h-3 w-16 bg-slate-200 rounded" />
                    <div className="h-6 w-24 bg-slate-300 rounded" />
                  </div>
                  <div className="h-9 w-28 bg-slate-300 rounded-lg" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
