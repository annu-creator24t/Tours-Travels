import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { CalendarCheck, Car, Users, IndianRupee, Clock } from 'lucide-react';

export default function AdminDashboardPage() {
  const stats = [
    {
      label: 'Pending Inquiries',
      value: '0',
      change: 'New requests',
      icon: Clock,
      color: 'text-amber-600 bg-amber-50',
    },
    {
      label: 'Active Bookings',
      value: '0',
      change: 'Confirmed trips',
      icon: CalendarCheck,
      color: 'text-blue-600 bg-blue-50',
    },
    {
      label: 'Total Fleet',
      value: '3',
      change: 'Active vehicles',
      icon: Car,
      color: 'text-emerald-600 bg-emerald-50',
    },
    {
      label: 'Active Drivers',
      value: '2',
      change: 'Available on call',
      icon: Users,
      color: 'text-purple-600 bg-purple-50',
    },
  ];

  return (
    <>
      <AdminHeader
        title="Operations Dashboard"
        subtitle="Live overview of fleet, bookings, and customer inquiries."
      />

      <main className="p-6 space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500">
                    {item.label}
                  </span>
                  <div className={`p-2 rounded-lg ${item.color}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="mt-3">
                  <span className="text-2xl font-bold text-slate-900">
                    {item.value}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-1">{item.change}</p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="text-sm font-bold text-slate-900 mb-4">
            Recent Booking Requests
          </h2>
          <div className="text-center py-12 text-slate-400 text-xs">
            No booking requests yet. Requests submitted from the website will appear here.
          </div>
        </div>
      </main>
    </>
  );
}
