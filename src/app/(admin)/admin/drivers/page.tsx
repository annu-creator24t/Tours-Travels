'use client';

import React, { useState, useEffect, useCallback } from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus,
  Users,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Phone,
  CreditCard,
  Award,
  CalendarCheck,
  Power,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { DriverStatus } from '@prisma/client';

interface Driver {
  id: string;
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  status: DriverStatus;
  createdAt: string;
  updatedAt: string;
  _count?: {
    bookings: number;
  };
}

interface DriverFormData {
  name: string;
  phone: string;
  licenseNumber: string;
  experienceYears: number;
  status: DriverStatus;
}

const initialFormData: DriverFormData = {
  name: '',
  phone: '',
  licenseNumber: '',
  experienceYears: 3,
  status: 'AVAILABLE',
};

export default function AdminDriversPage() {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriverId, setEditingDriverId] = useState<string | null>(null);
  const [formData, setFormData] = useState<DriverFormData>(initialFormData);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/drivers');
      const data = await res.json();
      if (res.ok && data.success) {
        setDrivers(data.data || []);
      } else {
        setErrorMessage(data.error || 'Failed to load drivers');
      }
    } catch {
      setErrorMessage('Network error while loading drivers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDrivers();
  }, [fetchDrivers]);

  const handleOpenAddModal = () => {
    setEditingDriverId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (driver: Driver) => {
    setEditingDriverId(driver.id);
    setFormData({
      name: driver.name,
      phone: driver.phone,
      licenseNumber: driver.licenseNumber,
      experienceYears: driver.experienceYears,
      status: driver.status,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const url = editingDriverId
        ? `/api/admin/drivers/${editingDriverId}`
        : '/api/admin/drivers';
      const method = editingDriverId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Operation failed');
      }

      setSuccessMessage(
        editingDriverId
          ? 'Driver details updated successfully!'
          : 'New driver profile registered successfully!'
      );
      setIsModalOpen(false);
      fetchDrivers();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (driverId: string, newStatus: DriverStatus) => {
    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDrivers((prev) =>
          prev.map((d) => (d.id === driverId ? { ...d, status: newStatus } : d))
        );
        setSuccessMessage(`Driver status updated to ${newStatus}`);
      } else {
        alert(data.error || 'Failed to update driver status');
      }
    } catch {
      alert('Error updating driver status');
    }
  };

  const handleToggleActive = async (driver: Driver) => {
    const nextStatus: DriverStatus =
      driver.status === 'INACTIVE' ? 'AVAILABLE' : 'INACTIVE';
    await handleStatusChange(driver.id, nextStatus);
  };

  const handleDelete = async (driverId: string, driverName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete driver "${driverName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/drivers/${driverId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setDrivers((prev) => prev.filter((d) => d.id !== driverId));
        setSuccessMessage(`Driver "${driverName}" was deleted.`);
      } else {
        alert(data.error || 'Failed to delete driver');
      }
    } catch {
      alert('Error deleting driver');
    }
  };

  return (
    <>
      <AdminHeader
        title="Driver Management"
        subtitle="Manage company drivers, license details, contact info, and operational availability."
      />

      <main className="p-6 space-y-6">
        {/* Top Notification Alerts */}
        {successMessage && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>{successMessage}</span>
            </div>
            <button
              onClick={() => setSuccessMessage(null)}
              className="text-emerald-600 hover:text-emerald-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Header Action Bar */}
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Registered Drivers ({drivers.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Qualified drivers available for dispatch on confirmed customer bookings.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Driver</span>
            </button>
          </div>

          {/* Drivers Table */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading driver roster...</span>
            </div>
          ) : drivers.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No drivers registered yet. Click &quot;Add New Driver&quot; to add your company drivers.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Driver Name</th>
                    <th className="py-3.5 px-4">Phone Number</th>
                    <th className="py-3.5 px-4">License Details</th>
                    <th className="py-3.5 px-4">Experience</th>
                    <th className="py-3.5 px-4">Total Trips</th>
                    <th className="py-3.5 px-4">Operational Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {drivers.map((d) => (
                    <tr key={d.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Driver Name & Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs flex-shrink-0 border border-blue-200">
                            {d.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs">
                              {d.name}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              Added {new Date(d.createdAt).toLocaleDateString('en-IN')}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Phone */}
                      <td className="py-4 px-4 font-medium text-slate-900">
                        <a
                          href={`tel:${d.phone}`}
                          className="inline-flex items-center gap-1.5 text-blue-600 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5 text-blue-500" />
                          <span>{d.phone}</span>
                        </a>
                      </td>

                      {/* License */}
                      <td className="py-4 px-4">
                        <div className="inline-flex items-center gap-1.5 bg-slate-100 px-2.5 py-1 rounded-md text-slate-700 font-mono text-[11px]">
                          <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d.licenseNumber}</span>
                        </div>
                      </td>

                      {/* Experience */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700 font-medium">
                          <Award className="w-3.5 h-3.5 text-amber-500" />
                          <span>{d.experienceYears} Years</span>
                        </span>
                      </td>

                      {/* Total Assigned Trips */}
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center gap-1 text-slate-700">
                          <CalendarCheck className="w-3.5 h-3.5 text-slate-400" />
                          <span>{d._count?.bookings ?? 0} Trips</span>
                        </span>
                      </td>

                      {/* Operational Status Selector */}
                      <td className="py-4 px-4">
                        <select
                          value={d.status}
                          onChange={(e) =>
                            handleStatusChange(
                              d.id,
                              e.target.value as DriverStatus
                            )
                          }
                          className={`px-2.5 py-1 rounded-full text-xs font-semibold border focus:outline-none cursor-pointer ${
                            d.status === 'AVAILABLE'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : d.status === 'ON_TRIP'
                              ? 'bg-blue-50 text-blue-700 border-blue-200'
                              : d.status === 'OFF_DUTY'
                              ? 'bg-amber-50 text-amber-700 border-amber-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}
                        >
                          <option value="AVAILABLE">AVAILABLE</option>
                          <option value="ON_TRIP">ON_TRIP</option>
                          <option value="OFF_DUTY">OFF_DUTY</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center space-x-1.5">
                          {/* Toggle Active/Inactive */}
                          <button
                            onClick={() => handleToggleActive(d)}
                            className={`p-1.5 rounded-md transition-colors ${
                              d.status === 'INACTIVE'
                                ? 'text-emerald-600 hover:bg-emerald-50'
                                : 'text-amber-600 hover:bg-amber-50'
                            }`}
                            title={
                              d.status === 'INACTIVE'
                                ? 'Activate Driver'
                                : 'Deactivate Driver'
                            }
                          >
                            <Power className="w-4 h-4" />
                          </button>

                          {/* Edit Driver */}
                          <button
                            onClick={() => handleOpenEditModal(d)}
                            className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                            title="Edit Driver Profile"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Driver */}
                          <button
                            onClick={() => handleDelete(d.id, d.name)}
                            className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                            title="Delete Driver"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Add / Edit Driver Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingDriverId ? 'Edit Driver Profile' : 'Add New Driver'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure driver contact, license number, and driving experience.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rajesh Kumar"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Phone Number (Mobile) *
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Commercial Driving License Number *
                </label>
                <input
                  type="text"
                  value={formData.licenseNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, licenseNumber: e.target.value })
                  }
                  placeholder="e.g. DL-0420110012345"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Experience (Years) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="60"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        experienceYears: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Operational Status
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as DriverStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE</option>
                    <option value="ON_TRIP">ON_TRIP</option>
                    <option value="OFF_DUTY">OFF_DUTY</option>
                    <option value="INACTIVE">INACTIVE</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  disabled={isSubmitting}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-bold shadow-sm transition-colors"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingDriverId ? 'Update Driver' : 'Save Driver'}</span>
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
