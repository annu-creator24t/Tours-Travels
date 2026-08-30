'use client';

import React, { useState } from 'react';
import { MessageCircle, Phone, X, ChevronUp } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const WhatsAppFloatingBtn: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const getWaUrl = (number: string) => {
    const cleanNumber = number.replace(/[^0-9]/g, '');
    return `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      `Hello ${companyConfig.name}, I would like to inquire about booking a vehicle.`
    )}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Expanded Multi-Desk Popup */}
      {isOpen && (
        <div className="mb-3 bg-white rounded-2xl border border-slate-200 shadow-2xl p-4 w-72 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-3">
            <div>
              <span className="font-bold text-slate-900 block text-xs">
                Chat on WhatsApp
              </span>
              <span className="text-[10px] text-slate-400">
                Choose an available coordinator
              </span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2">
            <a
              href={getWaUrl(companyConfig.whatsapp)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[11px] font-bold">Booking Desk 1</strong>
                  <span className="text-[10px] text-emerald-800 font-mono">
                    {companyConfig.phoneDisplay}
                  </span>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </a>

            <a
              href={getWaUrl(companyConfig.whatsapp2)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition-colors"
            >
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center flex-shrink-0">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <strong className="block text-[11px] font-bold">Booking Desk 2</strong>
                  <span className="text-[10px] text-emerald-800 font-mono">
                    {companyConfig.phone2Display}
                  </span>
                </div>
              </div>
              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                Online
              </span>
            </a>
          </div>
        </div>
      )}

      {/* Main Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-3 rounded-full shadow-lg transition-transform hover:scale-105"
        aria-label="Chat on WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-current" />
        <span className="text-xs font-bold tracking-wide hidden sm:inline">
          WhatsApp Inquiry
        </span>
        <ChevronUp
          className={`w-3.5 h-3.5 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
    </div>
  );
};

export default WhatsAppFloatingBtn;
