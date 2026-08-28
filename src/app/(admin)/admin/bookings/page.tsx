import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';

export default function AdminBookingsPage() {
  return (
    <>
      <AdminHeader
        title="Bookings & Inquiries"
        subtitle="Review, approve, and assign vehicles to customer trip requests."
      />

      <main className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">All Booking Requests</h2>
            <div className="flex gap-2">
              <span className="text-xs bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md">
                Filter: All
              </span>
            </div>
          </div>

          <div className="py-16 text-center text-xs text-slate-400">
            No bookings recorded yet. New inquiries will appear with customer contact and trip details.
          </div>
        </div>
      </main>
    </>
  );
}
