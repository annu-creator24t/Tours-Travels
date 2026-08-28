import React from 'react';
import AdminHeader from '@/components/admin/AdminHeader';
import { Plus } from 'lucide-react';

export default function AdminVehiclesPage() {
  return (
    <>
      <AdminHeader
        title="Fleet Management"
        subtitle="Manage fleet vehicles, specifications, rates, and active status."
      />

      <main className="p-6">
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Registered Vehicles</h2>
            <button className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors">
              <Plus className="w-3.5 h-3.5" />
              <span>Add Vehicle</span>
            </button>
          </div>

          <div className="py-16 text-center text-xs text-slate-400">
            Vehicle records and status toggles will be managed here.
          </div>
        </div>
      </main>
    </>
  );
}
