import React from 'react';
import { Calendar, User, Phone, MapPin, CheckCircle } from 'lucide-react';

export const metadata = {
  title: 'Book a Vehicle — Jay Maa Sheetala Tours & Travel',
  description: 'Submit an instant booking request for your outstation or local trip.',
};

export default function BookPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Trip Booking Request
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          No advance payment required now. Our team reviews your request and
          provides the best quote within 15 minutes.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-sm">
        <form className="space-y-6">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <User className="w-4 h-4 text-blue-600" />
              <span>1. Contact Details</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  WhatsApp Mobile Number *
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 9876543210"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 mb-4 pb-2 border-b border-slate-100 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>2. Trip Details</span>
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Pickup Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter pickup address/city"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Destination Location *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter destination city"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Travel Date & Time *
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Return Date & Time (Optional)
                  </label>
                  <input
                    type="datetime-local"
                    className="w-full px-3.5 py-2.5 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors text-sm"
            >
              Submit Booking Request
            </button>
            <p className="text-center text-[11px] text-slate-500 mt-2">
              🔒 No advance payment needed right now. We will confirm availability first.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
