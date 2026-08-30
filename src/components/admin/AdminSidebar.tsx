'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarCheck,
  Car,
  Users,
  Star,
  LogOut,
} from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Bookings', href: '/admin/bookings', icon: CalendarCheck },
  { name: 'Vehicles', href: '/admin/vehicles', icon: Car },
  { name: 'Drivers', href: '/admin/drivers', icon: Users },
  { name: 'Reviews', href: '/admin/reviews', icon: Star },
];

export const AdminSidebar: React.FC = () => {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth/logout', { method: 'POST' });
      router.push('/admin/login');
      router.refresh();
    } catch {
      window.location.href = '/admin/login';
    }
  };

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 min-h-screen flex flex-col justify-between p-4 border-r border-slate-800">
      <div>
        <div className="flex items-center space-x-2.5 px-2 py-4 mb-6 border-b border-slate-800">
          <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-950 border border-slate-800">
            <Image
              src={companyConfig.logoUrl}
              alt={companyConfig.name}
              fill
              sizes="32px"
              className="object-contain p-0.5"
              unoptimized
            />
          </div>
          <div>
            <span className="text-xs font-bold text-white block leading-tight">
              Jay Maa Sheetala
            </span>
            <span className="text-[10px] text-blue-400 font-semibold tracking-wider uppercase">
              Tours & Travel Admin
            </span>
          </div>
        </div>

        <nav className="space-y-1">
          {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Link
          href="/"
          className="flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors mb-1"
        >
          <span>← Back to Website</span>
        </Link>
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-xs font-medium text-rose-400 hover:bg-rose-950/40 transition-colors text-left"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
