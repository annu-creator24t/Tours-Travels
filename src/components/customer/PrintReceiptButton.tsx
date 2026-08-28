'use client';

import React from 'react';
import { Printer, Download } from 'lucide-react';

interface PrintReceiptButtonProps {
  className?: string;
  label?: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

export default function PrintReceiptButton({
  className = '',
  label = 'Print / Save Receipt (PDF)',
  variant = 'primary',
}: PrintReceiptButtonProps) {
  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  const baseStyles =
    'inline-flex items-center justify-center gap-2 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer';

  let variantStyles =
    'bg-blue-600 hover:bg-blue-700 text-white shadow-sm';
  if (variant === 'secondary') {
    variantStyles =
      'bg-slate-900 hover:bg-slate-800 text-white shadow-sm';
  } else if (variant === 'outline') {
    variantStyles =
      'border border-slate-300 hover:bg-slate-50 text-slate-700';
  }

  return (
    <button
      type="button"
      onClick={handlePrint}
      className={`${baseStyles} ${variantStyles} ${className}`}
    >
      <Printer className="w-4 h-4 flex-shrink-0" />
      <span>{label}</span>
    </button>
  );
}
