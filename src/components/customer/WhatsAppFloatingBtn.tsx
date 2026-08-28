'use client';

import React from 'react';
import { MessageCircle } from 'lucide-react';

export const WhatsAppFloatingBtn: React.FC = () => {
  const phone = process.env.NEXT_PUBLIC_COMPANY_WHATSAPP || '919876543210';
  const whatsappUrl = `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=Hello%2C%20I%20would%20like%20to%20inquire%20about%20booking%20a%20vehicle.`;

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
