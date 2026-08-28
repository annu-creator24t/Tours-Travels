'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Loader2,
  Search,
  User,
  Phone,
  Car,
  MapPin,
  Calendar,
  IndianRupee,
  Edit,
  X,
  UserCheck,
  Check,
  Ban,
  Mail,
  ShieldCheck,
  MessageCircle,
  PhoneCall,
  ExternalLink,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { BookingStatus, TripType } from '@prisma/client';
import { companyConfig } from '@/lib/company.config';

interface VehicleOption {
  id: string;
  name: string;
  brand: string;
  vehicleType: string;
  seatingCapacity?: number;
  perKmRate: string | number;
  baseDayRate: string | number;
}

interface DriverOption {
  id: string;
  name: string;
  phone: string;
  status: string;
  experienceYears: number;
}

interface PaymentRecord {
  id: string;
  transactionRef?: string | null;
  amount: string | number;
  paymentType: string;
  status: string;
  gatewayName: string;
  createdAt: string;
}

interface BookingRecord {
  id: string;
  bookingRef: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  pickupLocation: string;
  dropLocation: string;
  pickupDatetime: string;
  returnDatetime?: string | null;
  tripType: TripType;
  passengerCount: number;
  vehicleId?: string | null;
  driverId?: string | null;
  status: BookingStatus;
  estimatedPrice: string | number;
  finalPrice?: string | number | null;
  advanceAmount?: string | number | null;
  balanceAmount?: string | number | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  createdAt: string;
  vehicle?: VehicleOption | null;
  driver?: DriverOption | null;
  payments?: PaymentRecord[];
}

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Selected Booking for Modal
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [modalFormData, setModalFormData] = useState({
    status: 'PENDING' as BookingStatus,
    vehicleId: '',
    driverId: '',
    finalPrice: '',
    advanceAmount: '',
    balanceAmount: '',
    adminNotes: '',
  });

  const loadData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [bookingsRes, vehiclesRes, driversRes] = await Promise.all([
        fetch('/api/admin/bookings'),
        fetch('/api/admin/vehicles'),
        fetch('/api/admin/drivers'),
      ]);

      const [bookingsData, vehiclesData, driversData] = await Promise.all([
        bookingsRes.json(),
        vehiclesRes.json(),
        driversRes.json(),
      ]);

      if (bookingsRes.ok && bookingsData.success) {
        setBookings(bookingsData.data || []);
      }
      if (vehiclesRes.ok && vehiclesData.success) {
        setVehicles(vehiclesData.data || []);
      }
      if (driversRes.ok && driversData.success) {
        setDrivers(driversData.data || []);
      }
    } catch {
      setErrorMessage('Failed to load bookings and fleet records');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenManageModal = (booking: BookingRecord) => {
    setSelectedBooking(booking);
    setModalError(null);
    setModalFormData({
      status: booking.status,
      vehicleId: booking.vehicleId || '',
      driverId: booking.driverId || '',
      finalPrice: booking.finalPrice ? String(booking.finalPrice) : String(booking.estimatedPrice),
      advanceAmount: booking.advanceAmount ? String(booking.advanceAmount) : '0',
      balanceAmount: booking.balanceAmount ? String(booking.balanceAmount) : '',
      adminNotes: booking.adminNotes || '',
    });
  };

  const handleModalSubmit = async (e?: React.FormEvent, overrideStatus?: BookingStatus) => {
    if (e) e.preventDefault();
    if (!selectedBooking) return;

    setIsSubmitting(true);
    setErrorMessage(null);
    setModalError(null);
    setSuccessMessage(null);

    const targetStatus = overrideStatus || modalFormData.status;
    const finalPriceNum = modalFormData.finalPrice ? parseFloat(modalFormData.finalPrice) : null;
    const advanceAmountNum = modalFormData.advanceAmount ? parseFloat(modalFormData.advanceAmount) : null;
    const calculatedBalance =
      finalPriceNum !== null && advanceAmountNum !== null
        ? Math.max(0, finalPriceNum - advanceAmountNum)
        : null;

    try {
      const res = await fetch(`/api/admin/bookings/${selectedBooking.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          vehicleId: modalFormData.vehicleId || null,
          driverId: modalFormData.driverId || null,
          finalPrice: finalPriceNum,
          advanceAmount: advanceAmountNum,
          balanceAmount: calculatedBalance,
          adminNotes: modalFormData.adminNotes || null,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update booking status');
      }

      setSuccessMessage(`Booking #${selectedBooking.bookingRef} successfully updated to ${targetStatus}`);
      setSelectedBooking(null);
      loadData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error updating booking';
      setErrorMessage(msg);
      setModalError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;
    const matchesSearch =
      b.bookingRef.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.customerPhone.includes(searchTerm) ||
      (b.customerEmail && b.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.pickupLocation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.dropLocation.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <>
      <AdminHeader
        title="Bookings & Dispatch Management"
        subtitle="Review inquiries, approve quotes, assign vehicles/drivers, and track trip lifecycles."
      />

      <main className="p-6 space-y-6">
        {/* Top Notifications */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span className="font-medium">{successMessage}</span>
            </div>
            <button onClick={() => setSuccessMessage(null)} className="text-emerald-600 hover:text-emerald-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span className="font-medium">{errorMessage}</span>
            </div>
            <button onClick={() => setErrorMessage(null)} className="text-rose-600 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
            {['ALL', 'PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search ref, customer, phone, route..."
              className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
            />
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Trip Inquiries & Bookings ({filteredBookings.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No matching bookings found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Booking Ref</th>
                    <th className="py-3.5 px-4">Customer Details</th>
                    <th className="py-3.5 px-4">Route & Dates</th>
                    <th className="py-3.5 px-4">Allocated Fleet & Driver</th>
                    <th className="py-3.5 px-4">Quote & Payment</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredBookings.map((b) => {
                    const isAdvancePaid = b.payments?.some(
                      (p) => p.paymentType === 'ADVANCE' && p.status === 'PAID'
                    );

                    return (
                      <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4 font-bold text-blue-700">
                          <span>{b.bookingRef}</span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            {b.tripType} · {b.passengerCount} Pax
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <span className="font-bold text-slate-900 block">{b.customerName}</span>
                          <a
                            href={`tel:${b.customerPhone}`}
                            className="text-slate-600 hover:text-blue-600 font-medium block"
                          >
                            {b.customerPhone}
                          </a>
                          {b.customerEmail && (
                            <span className="text-[10px] text-slate-400 block truncate max-w-[150px]">
                              {b.customerEmail}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-semibold text-slate-800">
                            {b.pickupLocation} → {b.dropLocation}
                          </div>
                          <span className="text-[11px] text-slate-500 block">
                            Pickup: {new Date(b.pickupDatetime).toLocaleString('en-IN', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </span>
                          {b.returnDatetime && (
                            <span className="text-[10px] text-slate-400 block">
                              Return: {new Date(b.returnDatetime).toLocaleString('en-IN', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4">
                          <div>
                            {b.vehicle ? (
                              <span className="font-bold text-slate-900 block">
                                {b.vehicle.name} ({b.vehicle.vehicleType})
                              </span>
                            ) : (
                              <span className="text-amber-600 font-medium italic block">
                                No vehicle assigned
                              </span>
                            )}

                            {b.driver ? (
                              <span className="text-[11px] text-slate-600 block">
                                Driver: {b.driver.name} ({b.driver.phone})
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 block">
                                Driver: Unassigned
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <div className="font-bold text-slate-900">
                            ₹{b.finalPrice ? Number(b.finalPrice) : Number(b.estimatedPrice)}
                          </div>
                          {isAdvancePaid ? (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-1.5 py-0.5 rounded inline-block">
                              Advance Paid (₹{Number(b.advanceAmount)})
                            </span>
                          ) : b.advanceAmount && Number(b.advanceAmount) > 0 ? (
                            <span className="text-[10px] text-amber-700 block font-medium">
                              Advance Due: ₹{Number(b.advanceAmount)}
                            </span>
                          ) : (
                            <span className="text-[10px] text-slate-400 block">Payment: Pending</span>
                          )}
                        </td>

                        <td className="py-4 px-4">
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

                        <td className="py-4 px-4 text-right">
                          <button
                            onClick={() => handleOpenManageModal(b)}
                            className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-lg text-xs font-semibold shadow-sm transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                            <span>Manage</span>
                          </button>
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

      {/* Manage Booking Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">
                  Booking #{selectedBooking.bookingRef}
                </span>
                <h3 className="text-lg font-bold text-slate-900">
                  Manage Booking, Driver & Quote
                </h3>
              </div>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Traveler & Trip Overview Box */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs mb-5 space-y-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <span className="text-slate-400 block mb-0.5">Primary Passenger:</span>
                  <strong className="text-slate-900">{selectedBooking.customerName}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Contact Phone:</span>
                  <a href={`tel:${selectedBooking.customerPhone}`} className="text-blue-600 font-bold hover:underline">
                    {selectedBooking.customerPhone}
                  </a>
                </div>
                {selectedBooking.customerEmail && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Email Address:</span>
                    <strong className="text-slate-900">{selectedBooking.customerEmail}</strong>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block mb-0.5">Trip Type & Group:</span>
                  <strong className="text-slate-900">{selectedBooking.tripType} · {selectedBooking.passengerCount} Passengers</strong>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 block mb-0.5">Trip Route:</span>
                  <strong className="text-slate-900">{selectedBooking.pickupLocation} → {selectedBooking.dropLocation}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Pickup Datetime:</span>
                  <strong className="text-slate-900">
                    {new Date(selectedBooking.pickupDatetime).toLocaleString('en-IN', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </strong>
                </div>
                {selectedBooking.returnDatetime && (
                  <div>
                    <span className="text-slate-400 block mb-0.5">Return Datetime:</span>
                    <strong className="text-slate-900">
                      {new Date(selectedBooking.returnDatetime).toLocaleString('en-IN', {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      })}
                    </strong>
                  </div>
                )}
              </div>

              {selectedBooking.customerNotes && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="text-slate-400 block mb-0.5">Traveler Special Notes:</span>
                  <p className="text-slate-700 italic">{selectedBooking.customerNotes}</p>
                </div>
              )}
            </div>

            {/* In-Modal Error Notification */}
            {modalError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between mb-4 shadow-sm">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span className="font-medium">{modalError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setModalError(null)}
                  className="text-rose-600 hover:text-rose-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <form onSubmit={(e) => handleModalSubmit(e)} className="space-y-4 text-xs">
              {/* Status Transition Selector */}
              <div>
                <label className="block font-bold text-slate-800 mb-1.5">
                  Update Booking Status *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REJECTED'] as BookingStatus[]).map(
                    (st) => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setModalFormData({ ...modalFormData, status: st })}
                        className={`py-2 px-2 rounded-lg text-center font-bold text-[11px] border transition-all ${
                          modalFormData.status === st
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm ring-2 ring-blue-600/20'
                            : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {st}
                      </button>
                    )
                  )}
                </div>
              </div>

              {/* Vehicle & Driver Assignment */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assign Fleet Vehicle
                  </label>
                  <select
                    value={modalFormData.vehicleId}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, vehicleId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-xs"
                  >
                    <option value="">-- No Vehicle Assigned --</option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} ({v.brand}) - {v.vehicleType}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Assign Chauffeur / Driver
                  </label>
                  <select
                    value={modalFormData.driverId}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, driverId: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-xs"
                  >
                    <option value="">-- Unassigned --</option>
                    {drivers.map((d) => {
                      const isUnavailable = d.status === 'INACTIVE' || d.status === 'OFF_DUTY';
                      return (
                        <option
                          key={d.id}
                          value={d.id}
                          disabled={isUnavailable}
                        >
                          {d.name} ({d.phone}) - {d.status} {isUnavailable ? '(Unavailable)' : ''}
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {/* Pricing & Quotes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Final Trip Price (₹)
                  </label>
                  <input
                    type="number"
                    value={modalFormData.finalPrice}
                    onChange={(e) =>
                      setModalFormData({ ...modalFormData, finalPrice: e.target.value })
                    }
                    placeholder="e.g. 5500"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-xs"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Advance Amount Required (₹)
                  </label>
                  <input
                    type="number"
                    value={modalFormData.advanceAmount}
                    onChange={(e) =>
                      setModalFormData({
                        ...modalFormData,
                        advanceAmount: e.target.value,
                      })
                    }
                    placeholder="e.g. 1000"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white font-bold text-xs"
                  />
                </div>
              </div>

              {/* Internal Admin Notes */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Internal Admin Notes
                </label>
                <textarea
                  rows={2}
                  value={modalFormData.adminNotes}
                  onChange={(e) =>
                    setModalFormData({ ...modalFormData, adminNotes: e.target.value })
                  }
                  placeholder="e.g. Spoke with client. Driver Rajesh assigned. 1000 advance received via UPI."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedBooking(null)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving Changes...</span>
                    </>
                  ) : (
                    <span>Save & Update Booking</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
