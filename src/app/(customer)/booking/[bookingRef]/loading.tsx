import React from 'react';

export default function BookingStatusLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Navigation Breadcrumb Skeleton */}
        <div className="h-4 w-28 bg-slate-200 rounded mb-6" />

        {/* Main Status Container Skeleton */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-6">
          {/* Header Skeleton */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-100 gap-4">
            <div className="space-y-2">
              <div className="h-3 w-32 bg-slate-200 rounded" />
              <div className="h-8 w-48 bg-slate-300 rounded-lg" />
            </div>
            <div className="h-8 w-36 bg-slate-200 rounded-full" />
          </div>

          {/* Timeline Skeleton */}
          <div className="py-4 border-y border-slate-100 grid grid-cols-4 gap-2">
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
            <div className="h-12 bg-slate-100 rounded-xl" />
          </div>

          {/* Details Grid Skeleton */}
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-36 bg-slate-300 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-36 bg-slate-300 rounded" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-44 bg-slate-300 rounded" />
              </div>
              <div className="space-y-1">
                <div className="h-3 w-20 bg-slate-200 rounded" />
                <div className="h-5 w-44 bg-slate-300 rounded" />
              </div>
            </div>
          </div>

          {/* Bottom Box Skeleton */}
          <div className="h-28 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
