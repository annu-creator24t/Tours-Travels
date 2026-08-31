'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const WhatsAppFloatingBtn: React.FC = () => {
  const cleanNumber = companyConfig.whatsapp.replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
    `Hello ${companyConfig.name}, I would like to inquire about booking a vehicle.`
  )}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <a
        href={waUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          WhatsApp Inquiry
        </span>
      </a>
    </div>
  );
};

export default WhatsAppFloatingBtn;
