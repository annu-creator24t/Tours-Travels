import React from 'react';
import { ReviewSource } from '@prisma/client';
import { ShieldCheck, CheckCircle2, MessageSquare, ExternalLink } from 'lucide-react';

interface ReviewSourceBadgeProps {
  source: ReviewSource;
  sourceUrl?: string | null;
}

export default function ReviewSourceBadge({ source, sourceUrl }: ReviewSourceBadgeProps) {
  if (source === 'JUSTDIAL') {
    return (
      <div className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 border border-amber-300/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
        <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
        <span>Justdial Verified</span>
        {sourceUrl && (
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-amber-700 hover:text-amber-950 ml-0.5"
            title="View on Justdial"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    );
  }

  if (source === 'VERIFIED_CUSTOMER') {
    return (
      <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2.5 py-1 rounded-full text-[11px] font-bold">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
        <span>Verified Customer</span>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 border border-slate-300 px-2.5 py-1 rounded-full text-[11px] font-medium">
      <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
      <span>Customer Feedback</span>
    </div>
  );
}
