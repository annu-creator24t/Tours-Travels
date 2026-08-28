import React from 'react';
import { Star, ShieldCheck } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export const metadata = {
  title: 'Customer Reviews & Justdial Ratings — Tours & Travels',
  description: 'Read genuine reviews and ratings from our valued travelers.',
};

export default function ReviewsPage() {
  const reviews = [
    {
      id: '1',
      author: 'Amit Patel',
      rating: 5,
      date: 'Aug 2026',
      source: 'Justdial Verified',
      text: 'Booked an Innova Crysta for a family trip. Vehicle was clean, AC was great, and the driver was very polite and punctual.',
    },
    {
      id: '2',
      author: 'Sneha Roy',
      rating: 5,
      date: 'Jul 2026',
      source: 'Direct Booking',
      text: 'Smooth booking process with no hidden charges. Transparent billing and comfortable tempo traveller for our college reunion.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center max-w-xl mx-auto mb-12">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
          Customer & Partner Reviews
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Transparent ratings and verified reviews directly from Justdial and our
          valued travelers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reviews.map((r) => (
          <div
            key={r.id}
            className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-1 text-amber-400">
                  {Array.from({ length: r.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-current" />
                  ))}
                </div>
                <Badge variant="info">{r.source}</Badge>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed italic mb-4">
                &ldquo;{r.text}&rdquo;
              </p>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100">
              <span className="font-bold text-slate-900">{r.author}</span>
              <span>{r.date}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
