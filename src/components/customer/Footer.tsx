import React from 'react';
import Link from 'next/link';
import { Compass, Phone, Mail, MapPin, MessageCircle } from 'lucide-react';
import { companyConfig } from '@/lib/company.config';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 py-7 border-t border-slate-800/80 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800/70">
          {/* Brand & Quick CTA */}
          <div className="space-y-2.5">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white flex-shrink-0">
                <Compass className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-bold text-white tracking-tight">
                {companyConfig.name}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Trusted outstation car rentals, airport transfers, and group tour vehicles.
            </p>
            <div className="flex items-center gap-2 pt-0.5">
              <a
                href={`https://wa.me/${companyConfig.whatsapp.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800/50 px-2 py-1 rounded text-[11px] font-medium transition-colors"
              >
                <MessageCircle className="w-3 h-3 text-emerald-400" />
                <span>WhatsApp</span>
              </a>
              <a
                href={`tel:${companyConfig.phone}`}
                className="inline-flex items-center gap-1 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 px-2 py-1 rounded text-[11px] font-medium transition-colors"
              >
                <Phone className="w-3 h-3 text-blue-400" />
                <span>Call</span>
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

          {/* Direct Contact */}
          <div>
            <h4 className="text-[11px] font-bold text-slate-200 mb-2 uppercase tracking-wider">
              Contact & Address
            </h4>
            <div className="space-y-1.5 text-xs">
              <p className="flex items-center space-x-2">
                <Phone className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <a href={`tel:${companyConfig.phone}`} className="hover:text-white transition-colors">
                  {companyConfig.phoneDisplay}
                </a>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3 h-3 text-blue-400 flex-shrink-0" />
                <a href={`mailto:${companyConfig.email}`} className="hover:text-white transition-colors truncate">
                  {companyConfig.email}
                </a>
              </p>
              <p className="flex items-start space-x-2">
                <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">{companyConfig.address.fullAddress}</span>
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
