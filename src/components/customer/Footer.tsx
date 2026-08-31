import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Phone, Mail, MessageCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-7 border-t border-slate-800/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800/70">
          {/* Brand & Quick CTA */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2.5">
              <div className="relative w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center flex-shrink-0 bg-slate-900 border border-slate-800">
                <Image
                  src={companyConfig.logoUrl}
                  alt={companyConfig.name}
                  fill
                  sizes="32px"
                  className="object-contain p-0.5"
                  unoptimized
                />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                {companyConfig.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trusted outstation car rentals, airport transfers, and group tour vehicles.
            </p>
            <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
              <a
                href={companyConfig.contacts[0].whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                title={`WhatsApp: ${companyConfig.phoneDisplay}`}
              >
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp 1</span>
              </a>
              <a
                href={companyConfig.contacts[1].whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
                title={`WhatsApp: ${companyConfig.phone2Display}`}
              >
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp 2</span>
              </a>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 mb-2 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <Link href="/vehicles" className="hover:text-white transition-colors">
                  Our Fleet
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book Vehicle
                </Link>
              </li>
              <li>
                <Link href="/booking" className="hover:text-white transition-colors">
                  Track Booking Status
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Customer & Justdial Reviews
                </Link>
              </li>
            </ul>
          </div>

          {/* Fleet Categories */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 mb-2 uppercase tracking-wider">
              Fleet Range
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li>Sedans (Dzire, Etios)</li>
              <li>Premium SUVs (Innova Crysta)</li>
              <li>Tempo Travellers (12 & 17 Seater)</li>
              <li>MUVs & Family Rentals</li>
            </ul>
          </div>

          {/* Direct Contact & Support */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 mb-2 uppercase tracking-wider">
              Contact & Support
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <a href={`tel:${companyConfig.phone}`} className="hover:text-white transition-colors" title="Desk 1">
                  {companyConfig.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <a href={`tel:${companyConfig.phone2}`} className="hover:text-white transition-colors" title="Desk 2">
                  {companyConfig.phone2Display}
                </a>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${companyConfig.email}`} className="hover:text-white transition-colors truncate">
                  {companyConfig.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Compact Bottom Bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
          <p>© {new Date().getFullYear()} {companyConfig.name}. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <Link href="/reviews" className="hover:text-slate-400 transition-colors">
              Ratings & Feedback
            </Link>
            <span className="text-slate-700">·</span>
            <Link href="/admin/login" className="hover:text-slate-400 transition-colors">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
