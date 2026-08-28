import React from 'react';
import { CheckCircle2, Clock, ShieldCheck, Flag, CreditCard } from 'lucide-react';

interface BookingTimelineProps {
  status: string;
  isAdvancePaid: boolean;
  hasAdvanceRequired: boolean;
}

export default function BookingTimeline({
  status,
  isAdvancePaid,
  hasAdvanceRequired,
}: BookingTimelineProps) {
  // Determine step states
  // Step 1: Request Submitted (Always done if booking exists)
  // Step 2: Admin Confirmed (Done if status is CONFIRMED or COMPLETED)
  // Step 3: Advance Paid (Done if isAdvancePaid; skipped/auto-done if no advance required and confirmed)
  // Step 4: Booking Confirmed (Done if CONFIRMED & (isAdvancePaid || !hasAdvanceRequired) or COMPLETED)
  // Step 5: Trip Completed (Done if COMPLETED)

  const isConfirmedOrBeyond = status === 'CONFIRMED' || status === 'COMPLETED';
  const isPaidOrNoAdvance = isAdvancePaid || (!hasAdvanceRequired && isConfirmedOrBeyond);
  const isTripReady = isConfirmedOrBeyond && isPaidOrNoAdvance;
  const isCompleted = status === 'COMPLETED';

  const steps = [
    {
      id: 1,
      label: 'Booking Request',
      description: 'Inquiry Submitted',
      icon: Clock,
      isCompleted: true,
      isActive: status === 'PENDING',
    },
    {
      id: 2,
      label: 'Admin Confirmed',
      description: isConfirmedOrBeyond ? 'Quote & Fleet Set' : 'Under Review',
      icon: ShieldCheck,
      isCompleted: isConfirmedOrBeyond,
      isActive: status === 'PENDING',
    },
    {
      id: 3,
      label: 'Advance Paid',
      description: isAdvancePaid
        ? 'Advance Secured'
        : hasAdvanceRequired
        ? 'Payment Pending'
        : 'Not Required',
      icon: CreditCard,
      isCompleted: isAdvancePaid || (!hasAdvanceRequired && isConfirmedOrBeyond),
      isActive: isConfirmedOrBeyond && !isAdvancePaid && hasAdvanceRequired,
    },
    {
      id: 4,
      label: 'Booking Confirmed',
      description: isTripReady ? 'Trip Ready & Locked' : 'Awaiting Payment',
      icon: CheckCircle2,
      isCompleted: isTripReady,
      isActive: isTripReady && !isCompleted,
    },
    {
      id: 5,
      label: 'Trip Completed',
      description: isCompleted ? 'Successfully Concluded' : 'Trip Scheduled',
      icon: Flag,
      isCompleted: isCompleted,
      isActive: isCompleted,
    },
  ];

  return (
    <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-5">
      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
        Booking Lifecycle Timeline
      </h3>

      <div className="relative">
        {/* Desktop / Tablet Timeline */}
        <div className="hidden sm:grid sm:grid-cols-5 gap-2 relative">
          {/* Background Track */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />

          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.id}
                className="relative z-10 flex flex-col items-center text-center px-1"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors mb-2 ${
                    step.isCompleted
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-100 shadow-sm'
                      : step.isActive
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 animate-pulse'
                      : 'bg-white border-2 border-slate-300 text-slate-400'
                  }`}
                >
                  {step.isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    <Icon className="w-3.5 h-3.5" />
                  )}
                </div>
                <span
                  className={`text-[11px] font-bold block leading-tight ${
                    step.isCompleted
                      ? 'text-slate-900'
                      : step.isActive
                      ? 'text-blue-700 font-extrabold'
                      : 'text-slate-400'
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[10px] text-slate-500 mt-0.5 leading-tight">
                  {step.description}
                </span>
              </div>
            );
          })}
        </div>

        {/* Mobile Vertical Timeline */}
        <div className="sm:hidden space-y-3">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="relative flex flex-col items-center">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      step.isCompleted
                        ? 'bg-emerald-600 text-white'
                        : step.isActive
                        ? 'bg-blue-600 text-white ring-2 ring-blue-100'
                        : 'bg-white border border-slate-300 text-slate-400'
                    }`}
                  >
                    {step.isCompleted ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : (
                      <Icon className="w-3 h-3" />
                    )}
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-6 ${
                        step.isCompleted ? 'bg-emerald-500' : 'bg-slate-200'
                      }`}
                    />
                  )}
                </div>
                <div className="pt-0.5">
                  <span
                    className={`text-xs font-bold block leading-tight ${
                      step.isCompleted
                        ? 'text-slate-900'
                        : step.isActive
                        ? 'text-blue-700 font-extrabold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </span>
                  <span className="text-[10px] text-slate-500 block leading-tight">
                    {step.description}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
