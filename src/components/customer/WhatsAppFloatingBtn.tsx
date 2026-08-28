'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const WhatsAppFloatingBtn: React.FC = () => {
  const whatsappUrl = `https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
    `Hello ${companyConfig.name}, I would like to inquire about booking a vehicle.`
  )}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="w-5 h-5 fill-current" />
      <span className="text-xs font-bold tracking-wide hidden sm:inline">
        WhatsApp Inquiry
      </span>
    </a>
  );
};

export default WhatsAppFloatingBtn;
