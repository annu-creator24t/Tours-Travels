'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Car,
  CheckCircle2,
  Navigation,
  Wrench,
  Clock,
  CalendarCheck,
  Sparkles,
  Ban,
  IndianRupee,
  Loader2,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { BookingStatus } from '@prisma/client';

interface DashboardStats {
  vehicles: {
    total: number;
    available: number;
    onTrip: number;
    maintenance: number;
  };
  bookings: {
    pending: number;
    confirmed: number;
    completed: number;
    cancelled: number;
  };
  finance: {
    totalAdvanceReceived: number;
  };
}

interface RecentBooking {
  id: string;
  bookingRef: string;
  customerName: string;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: string;
  status: BookingStatus;
  finalPrice?: string | number | null;
  estimatedPrice: string | number;
  advanceAmount?: string | number | null;
  createdAt: string;
  vehicle?: {
    name: string;
    brand: string;
    vehicleType: string;
  } | null;
  payments?: Array<{
    id: string;
    paymentType: string;
    status: string;
    amount: string | number;
  }>;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/dashboard');
      const json = await res.json();

      if (!res.ok || !json.success) {
        throw new Error(json.error || 'Failed to load dashboard metrics');
      }

      setStats(json.data.stats);
      setRecentBookings(json.data.recentBookings || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error fetching dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return (
    <>
      <AdminHeader
        title="Operations Dashboard"
        subtitle="Live overview of fleet operations, booking lifecycles, and financial metrics."
      />

      <main className="p-6 space-y-6">
        {/* Error notification */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={fetchDashboardData}
              className="text-xs font-bold text-rose-700 hover:underline flex items-center gap-1"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </button>
          </div>
        )}

        {/* Section 1: Fleet Inventory & Operational Status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Fleet Inventory & Status
            </h2>
            <Link
              href="/admin/vehicles"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>Manage Vehicles</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Vehicles */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Total Fleet</span>
                <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
                  <Car className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">
                  {isLoading ? '...' : stats?.vehicles.total ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Total registered vehicles</p>
              </div>
            </div>

            {/* Available Vehicles */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Available</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-emerald-700">
                  {isLoading ? '...' : stats?.vehicles.available ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Ready for dispatch</p>
              </div>
            </div>

            {/* Vehicles on Trip */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">On Trip</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <Navigation className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-blue-700">
                  {isLoading ? '...' : stats?.vehicles.onTrip ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Currently active on road</p>
              </div>
            </div>

            {/* Under Maintenance */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Maintenance</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Wrench className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-amber-700">
                  {isLoading ? '...' : stats?.vehicles.maintenance ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Under service / inspection</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 2: Bookings Pipeline & Financial Overview */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Bookings & Revenue Metrics
            </h2>
            <Link
              href="/admin/bookings"
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <span>View All Bookings</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Pending Inquiries */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Pending</span>
                <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-amber-700">
                  {isLoading ? '...' : stats?.bookings.pending ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Awaiting admin review</p>
              </div>
            </div>

            {/* Confirmed Bookings */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Confirmed</span>
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                  <CalendarCheck className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-blue-700">
                  {isLoading ? '...' : stats?.bookings.confirmed ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Scheduled & reserved</p>
              </div>
            </div>

            {/* Completed Trips */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Completed</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-emerald-700">
                  {isLoading ? '...' : stats?.bookings.completed ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Successfully finished</p>
              </div>
            </div>

            {/* Cancelled Bookings */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Cancelled</span>
                <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
                  <Ban className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-rose-700">
                  {isLoading ? '...' : stats?.bookings.cancelled ?? 0}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Not active / released</p>
              </div>
            </div>

            {/* Total Advance Received */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500">Advance Received</span>
                <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
                  <IndianRupee className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-emerald-700">
                  ₹{isLoading ? '...' : (stats?.finance.totalAdvanceReceived ?? 0).toLocaleString('en-IN')}
                </span>
                <p className="text-[11px] text-slate-400 mt-1">Verified advance payments</p>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Recent Bookings Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Recent Bookings</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Latest customer trip inquiries and dispatch requests
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={fetchDashboardData}
                disabled={isLoading}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <Link
                href="/admin/bookings"
                className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <span>View Full Registry</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {isLoading ? (
            <div className="py-16 text-center text-slate-400 text-xs flex flex-col items-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
              <span>Loading latest bookings...</span>
            </div>
          ) : recentBookings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No bookings submitted yet. Customer requests from the website will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Customer</th>
                    <th className="py-3.5 px-4">Vehicle</th>
                    <th className="py-3.5 px-4">Travel Date</th>
                    <th className="py-3.5 px-4">Booking Status</th>
                    <th className="py-3.5 px-4">Payment Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {recentBookings.map((b) => {
                    const isAdvancePaid = b.payments?.some(
                      (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
                    );

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Booking Ref */}
                        <td className="py-3.5 px-4 font-bold text-blue-700">
                          <Link href="/admin/bookings" className="hover:underline">
                            {b.bookingRef}
                          </Link>
                        </td>

                        {/* Customer Name */}
                        <td className="py-3.5 px-4 font-semibold text-slate-900">
                          {b.customerName}
                        </td>

                        {/* Vehicle */}
                        <td className="py-3.5 px-4">
                          {b.vehicle ? (
                            <span className="text-slate-800 font-medium">
                              {b.vehicle.brand} {b.vehicle.name}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Unassigned</span>
                          )}
                        </td>

                        {/* Travel Date */}
                        <td className="py-3.5 px-4 text-slate-700">
                          {new Date(b.pickupDatetime).toLocaleString('en-IN', {
                            dateStyle: 'short',
                            timeStyle: 'short',
                          })}
                        </td>

                        {/* Booking Status */}
                        <td className="py-3.5 px-4">
                          {b.status === 'PENDING' && (
                            <Badge variant="warning">PENDING</Badge>
                          )}
                          {b.status === 'CONFIRMED' && (
                            <Badge variant="success">CONFIRMED</Badge>
                          )}
                          {b.status === 'COMPLETED' && (
                            <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              COMPLETED
                            </span>
                          )}
                          {b.status === 'CANCELLED' && (
                            <Badge variant="danger">CANCELLED</Badge>
                          )}
                          {b.status === 'REJECTED' && (
                            <Badge variant="danger">REJECTED</Badge>
                          )}
                        </td>

                        {/* Payment Status */}
                        <td className="py-3.5 px-4">
                          {isAdvancePaid ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px] inline-flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Advance Paid</span>
                            </span>
                          ) : b.advanceAmount && Number(b.advanceAmount) > 0 ? (
                            <span className="text-[11px] text-amber-700 font-medium">
                              Advance Due: ₹{Number(b.advanceAmount)}
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-400">
                              Payment: Pending Quote
                            </span>
                          )}
                        </td>

                        {/* Action */}
                        <td className="py-3.5 px-4 text-right">
                          <Link
                            href="/admin/bookings"
                            className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-xs"
                          >
                            <span>Manage</span>
                            <ExternalLink className="w-3 h-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
