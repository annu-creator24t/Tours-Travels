'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import AdminHeader from '@/components/admin/AdminHeader';
import {
  Plus,
  Car,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  X,
  Loader2,
  Users,
  Briefcase,
  Snowflake,
  Fuel,
  Star,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { VehicleStatus } from '@prisma/client';

interface VehicleImage {
  id: string;
  imageUrl: string;
  isPrimary: boolean;
  displayOrder: number;
}

interface Vehicle {
  id: string;
  slug: string;
  name: string;
  brand: string;
  vehicleType: string;
  seatingCapacity: number;
  luggageCapacity: number;
  hasAc: boolean;
  fuelType: string;
  transmission?: string | null;
  perKmRate: string | number;
  baseDayRate: string | number;
  status: VehicleStatus;
  isFeatured: boolean;
  images?: VehicleImage[];
  _count?: { bookings: number; reviews: number };
}

interface VehicleFormData {
  name: string;
  brand: string;
  vehicleType: string;
  seatingCapacity: number;
  luggageCapacity: number;
  hasAc: boolean;
  fuelType: string;
  transmission: string;
  perKmRate: number;
  baseDayRate: number;
  status: VehicleStatus;
  isFeatured: boolean;
  imageUrl: string;
}

const initialFormData: VehicleFormData = {
  name: '',
  brand: '',
  vehicleType: 'Sedan',
  seatingCapacity: 4,
  luggageCapacity: 2,
  hasAc: true,
  fuelType: 'Petrol',
  transmission: 'Manual',
  perKmRate: 12,
  baseDayRate: 2500,
  status: 'AVAILABLE',
  isFeatured: false,
  imageUrl: '',
};

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingVehicleId, setEditingVehicleId] = useState<string | null>(null);
  const [formData, setFormData] = useState<VehicleFormData>(initialFormData);

  const fetchVehicles = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/admin/vehicles');
      const data = await res.json();
      if (res.ok && data.success) {
        setVehicles(data.data || []);
      } else {
        setErrorMessage(data.error || 'Failed to load vehicles');
      }
    } catch {
      setErrorMessage('Network error while loading vehicles');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

  const handleOpenAddModal = () => {
    setEditingVehicleId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setEditingVehicleId(vehicle.id);
    const primaryImg = vehicle.images?.find((img) => img.isPrimary)?.imageUrl || vehicle.images?.[0]?.imageUrl || '';
    setFormData({
      name: vehicle.name,
      brand: vehicle.brand,
      vehicleType: vehicle.vehicleType,
      seatingCapacity: Number(vehicle.seatingCapacity),
      luggageCapacity: Number(vehicle.luggageCapacity),
      hasAc: vehicle.hasAc,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission || 'Manual',
      perKmRate: Number(vehicle.perKmRate),
      baseDayRate: Number(vehicle.baseDayRate),
      status: vehicle.status,
      isFeatured: vehicle.isFeatured,
      imageUrl: primaryImg,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const payload = {
      ...formData,
      imageUrls: formData.imageUrl ? [formData.imageUrl] : [],
    };

    try {
      const url = editingVehicleId
        ? `/api/admin/vehicles/${editingVehicleId}`
        : '/api/admin/vehicles';
      const method = editingVehicleId ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Operation failed');
      }

      setSuccessMessage(
        editingVehicleId
          ? 'Vehicle updated successfully!'
          : 'New vehicle registered successfully!'
      );
      setIsModalOpen(false);
      fetchVehicles();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (vehicleId: string, newStatus: VehicleStatus) => {
    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVehicles((prev) =>
          prev.map((v) => (v.id === vehicleId ? { ...v, status: newStatus } : v))
        );
        setSuccessMessage(`Vehicle status changed to ${newStatus}`);
      } else {
        alert(data.error || 'Failed to update status');
      }
    } catch {
      alert('Error updating status');
    }
  };

  const handleDelete = async (vehicleId: string, vehicleName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${vehicleName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/vehicles/${vehicleId}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setVehicles((prev) => prev.filter((v) => v.id !== vehicleId));
        setSuccessMessage(`"${vehicleName}" was removed from fleet.`);
      } else {
        alert(data.error || 'Failed to delete vehicle');
      }
    } catch {
      alert('Error deleting vehicle');
    }
  };

  return (
    <>
      <AdminHeader
        title="Fleet Management"
        subtitle="Manage fleet vehicles, specifications, rates, and active operational status."
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
                Registered Fleet ({vehicles.length})
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Active vehicles available for customer booking and outstation tours.
              </p>
            </div>
            <button
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-sm transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Vehicle</span>
            </button>
          </div>

          {/* Vehicles Table */}
          {isLoading ? (
            <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span>Loading fleet inventory...</span>
            </div>
          ) : vehicles.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              No vehicles registered yet. Click &quot;Add New Vehicle&quot; to register your fleet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="py-3.5 px-4">Vehicle Details</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Specs</th>
                    <th className="py-3.5 px-4">Rates (Per-KM / Day)</th>
                    <th className="py-3.5 px-4">Operational Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vehicles.map((v) => {
                    const primaryImg =
                      v.images?.find((img) => img.isPrimary)?.imageUrl ||
                      v.images?.[0]?.imageUrl;

                    return (
                      <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-14 h-11 bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 border border-slate-200">
                              {primaryImg ? (
                                <Image
                                  src={primaryImg}
                                  alt={v.name}
                                  width={56}
                                  height={44}
                                  className="w-full h-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <Car className="w-6 h-6 text-slate-400" />
                              )}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{v.name}</span>
                                {v.isFeatured && (
                                  <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                                )}
                              </div>
                              <span className="text-[11px] text-slate-400 block">
                                {v.brand} · Slug: {v.slug}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <Badge variant="default">{v.vehicleType}</Badge>
                        </td>

                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3 text-slate-500">
                            <span className="flex items-center gap-1" title="Seats">
                              <Users className="w-3.5 h-3.5 text-slate-400" />
                              {v.seatingCapacity}
                            </span>
                            <span className="flex items-center gap-1" title="Luggage">
                              <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                              {v.luggageCapacity}
                            </span>
                            <span className="flex items-center gap-1" title="AC">
                              <Snowflake className="w-3.5 h-3.5 text-slate-400" />
                              {v.hasAc ? 'AC' : 'Non-AC'}
                            </span>
                            <span className="flex items-center gap-1" title="Fuel">
                              <Fuel className="w-3.5 h-3.5 text-slate-400" />
                              {v.fuelType}
                            </span>
                          </div>
                        </td>

                        <td className="py-4 px-4 font-medium text-slate-900">
                          <div>₹{Number(v.perKmRate)}/km</div>
                          <div className="text-[11px] text-slate-400 font-normal">
                            ₹{Number(v.baseDayRate)}/day base
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <select
                            value={v.status}
                            onChange={(e) =>
                              handleStatusChange(
                                v.id,
                                e.target.value as VehicleStatus
                              )
                            }
                            className={`px-2.5 py-1 rounded-full text-xs font-semibold border focus:outline-none cursor-pointer ${
                              v.status === 'AVAILABLE'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : v.status === 'ON_TRIP' || v.status === 'BOOKED'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : v.status === 'MAINTENANCE'
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            <option value="AVAILABLE">AVAILABLE</option>
                            <option value="BOOKED">BOOKED</option>
                            <option value="ON_TRIP">ON_TRIP</option>
                            <option value="MAINTENANCE">MAINTENANCE</option>
                            <option value="INACTIVE">INACTIVE</option>
                          </select>
                        </td>

                        <td className="py-4 px-4 text-right">
                          <div className="inline-flex items-center space-x-2">
                            <button
                              onClick={() => handleOpenEditModal(v)}
                              className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                              title="Edit Vehicle"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(v.id, v.name)}
                              className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                              title="Delete Vehicle"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
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

      {/* Add / Edit Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  {editingVehicleId ? 'Edit Vehicle Specifications' : 'Add New Fleet Vehicle'}
                </h3>
                <p className="text-xs text-slate-500">
                  Configure vehicle rates, seating, luggage capacity, and availability.
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Vehicle Model Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Innova Crysta"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Brand / Manufacturer *
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Toyota"
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Category Type *
                  </label>
                  <select
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Sedan">Sedan</option>
                    <option value="MUV">MUV</option>
                    <option value="Premium SUV">Premium SUV</option>
                    <option value="Luxury Van">Luxury Van</option>
                    <option value="Tempo Traveller">Tempo Traveller</option>
                    <option value="Coach/Bus">Coach / Bus</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Seating Capacity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.seatingCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, seatingCapacity: parseInt(e.target.value, 10) || 1 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Luggage Capacity (Bags)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    value={formData.luggageCapacity}
                    onChange={(e) =>
                      setFormData({ ...formData, luggageCapacity: parseInt(e.target.value, 10) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Fuel Type *</label>
                  <select
                    value={formData.fuelType}
                    onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Petrol">Petrol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Petrol/CNG">Petrol / CNG</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transmission</label>
                  <select
                    value={formData.transmission}
                    onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="Manual">Manual</option>
                    <option value="Automatic">Automatic</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Air Conditioning</label>
                  <select
                    value={formData.hasAc ? 'true' : 'false'}
                    onChange={(e) => setFormData({ ...formData, hasAc: e.target.value === 'true' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="true">Yes (AC)</option>
                    <option value="false">No (Non-AC)</option>
                  </select>
                </div>
              </div>

              {/* Pricing Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Rate Per KM (₹) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    value={formData.perKmRate}
                    onChange={(e) =>
                      setFormData({ ...formData, perKmRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1">
                    Base Daily Rate (₹) *
                  </label>
                  <input
                    type="number"
                    min="100"
                    step="50"
                    value={formData.baseDayRate}
                    onChange={(e) =>
                      setFormData({ ...formData, baseDayRate: parseFloat(e.target.value) || 0 })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none font-bold"
                    required
                  />
                </div>
              </div>

              {/* Status & Featured */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value as VehicleStatus })
                    }
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white"
                  >
                    <option value="AVAILABLE">AVAILABLE (Active)</option>
                    <option value="MAINTENANCE">MAINTENANCE (Temporarily Blocked)</option>
                    <option value="INACTIVE">INACTIVE (Hidden)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Primary Image URL</label>
                  <input
                    type="url"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="isFeatured" className="font-semibold text-slate-800 cursor-pointer">
                  Feature this vehicle on Home Page showcase
                </label>
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
                    <span>{editingVehicleId ? 'Update Vehicle' : 'Save Vehicle'}</span>
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
