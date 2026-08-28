import React from 'react';
import { ShieldCheck, User } from 'lucide-react';

interface AdminHeaderProps {
  title: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ title, subtitle }) => {
  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
      </div>

      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-semibold text-slate-700">Administrator</span>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-600">
          <User className="w-4 h-4" />
        </div>
      </div>
    </header>
  );
};

export default AdminHeader;
