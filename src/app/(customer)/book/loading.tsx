import React from 'react';

export default function BookLoading() {
  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 animate-pulse">
        {/* Header Skeleton */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="h-6 w-40 bg-slate-200 rounded-full mx-auto mb-3" />
          <div className="h-9 w-64 bg-slate-300 rounded-xl mx-auto mb-2" />
          <div className="h-4 w-80 bg-slate-200 rounded mx-auto" />
        </div>

        {/* Main Form Skeleton Card */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-10 shadow-sm space-y-8">
          {/* Step Progress Bar Skeleton */}
          <div className="grid grid-cols-3 gap-3 pb-6 border-b border-slate-100">
            <div className="h-8 bg-slate-200 rounded-xl" />
            <div className="h-8 bg-slate-200 rounded-xl" />
            <div className="h-8 bg-slate-200 rounded-xl" />
          </div>

          {/* Form Fields Skeletons */}
          <div className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-28 bg-slate-200 rounded" />
                <div className="h-11 bg-slate-100 rounded-xl" />
              </div>
            </div>
          </div>

          {/* Action Button Skeleton */}
          <div className="pt-6 border-t border-slate-100 flex justify-end">
            <div className="h-12 w-44 bg-blue-600/40 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
