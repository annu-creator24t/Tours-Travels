import React from 'react';
import Link from 'next/link';
import { Compass, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-lg font-bold text-white">Tours & Travels</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Safe, dependable, and comfortable vehicle rentals for outstation
              trips, airport transfers, and customized tours.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/" className="hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/vehicles" className="hover:text-white transition-colors">
                  Explore Fleet
                </Link>
              </li>
              <li>
                <Link href="/book" className="hover:text-white transition-colors">
                  Book Vehicle
                </Link>
              </li>
              <li>
                <Link href="/reviews" className="hover:text-white transition-colors">
                  Customer & Justdial Reviews
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
              Fleet Types
            </h4>
            <ul className="space-y-2 text-xs">
              <li>Sedans (Dzire, Etios)</li>
              <li>Premium SUVs (Innova Crysta)</li>
              <li>Tempo Travellers (12 & 17 Seater)</li>
              <li>Luxury Coaches & Buses</li>
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wider">
              Contact & Support
            </h4>
            <div className="space-y-2 text-xs">
              <p className="flex items-center space-x-2">
                <Phone className="w-3.5 h-3.5 text-blue-400" />
                <span>+91 98765 43210</span>
              </p>
              <p className="flex items-center space-x-2">
                <Mail className="w-3.5 h-3.5 text-blue-400" />
                <span>contact@tourstravels.com</span>
              </p>
              <p className="flex items-center space-x-2">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                <span>Main Office, City Center</span>
              </p>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Tours & Travels. All rights reserved.</p>
          <div className="flex space-x-4 mt-3 sm:mt-0">
            <Link href="/admin/login" className="hover:text-slate-400">
              Admin Portal
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
