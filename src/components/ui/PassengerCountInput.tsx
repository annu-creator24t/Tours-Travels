'use client';

import React, { useState, useEffect } from 'react';
import { Minus, Plus, Users } from 'lucide-react';

interface PassengerCountInputProps {
  value: number;
  onChange: (count: number) => void;
  min?: number;
  max?: number;
  vehicleCapacity?: number;
  className?: string;
}

export const PassengerCountInput: React.FC<PassengerCountInputProps> = ({
  value,
  onChange,
  min = 1,
  max = 60,
  vehicleCapacity,
  className = '',
}) => {
  // Local string state to allow natural typing without snapping back to 1 on backspace
  const [inputValue, setInputValue] = useState<string>(String(value || min));

  useEffect(() => {
    setInputValue(String(value));
  }, [value]);

  const updateCount = (newCount: number) => {
    const clamped = Math.max(min, Math.min(max, newCount));
    onChange(clamped);
    setInputValue(String(clamped));
  };

  const handleIncrement = () => {
    const current = parseInt(inputValue, 10) || value || min;
    if (current < max) {
      updateCount(current + 1);
    }
  };

  const handleDecrement = () => {
    const current = parseInt(inputValue, 10) || value || min;
    if (current > min) {
      updateCount(current - 1);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setInputValue(text);

    // If valid number entered, propagate immediately
    const parsed = parseInt(text, 10);
    if (!isNaN(parsed) && parsed >= min && parsed <= max) {
      onChange(parsed);
    }
  };

  const handleBlur = () => {
    const parsed = parseInt(inputValue, 10);
    if (isNaN(parsed) || parsed < min) {
      updateCount(min);
    } else if (parsed > max) {
      updateCount(max);
    } else {
      updateCount(parsed);
    }
  };

  const currentNum = parseInt(inputValue, 10) || value || min;

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center space-x-2">
        {/* Decrement Button */}
        <button
          type="button"
          onClick={handleDecrement}
          disabled={currentNum <= min}
          aria-label="Decrease passenger count"
          className="w-10 h-10 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 disabled:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed text-slate-700 flex items-center justify-center font-bold text-sm transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <Minus className="w-4 h-4" />
        </button>

        {/* Number Input Display */}
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <input
            type="number"
            min={min}
            max={max}
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleBlur}
            aria-label="Passenger count"
            className="w-full pl-9 pr-14 py-2.5 bg-white border border-slate-300 rounded-xl text-center text-xs sm:text-sm font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] font-semibold text-slate-400 pointer-events-none">
            {currentNum === 1 ? 'Person' : 'Persons'}
          </span>
        </div>

        {/* Increment Button */}
        <button
          type="button"
          onClick={handleIncrement}
          disabled={currentNum >= max}
          aria-label="Increase passenger count"
          className="w-10 h-10 rounded-xl border border-blue-600 bg-blue-50 hover:bg-blue-100 disabled:bg-slate-100 disabled:border-slate-300 disabled:opacity-40 disabled:cursor-not-allowed text-blue-700 flex items-center justify-center font-bold text-sm transition-all shadow-sm active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Common Passenger Presets */}
      <div className="flex items-center gap-1.5 pt-0.5">
        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
          Quick:
        </span>
        {[1, 2, 4, 6, 7, 12, 17].map((num) => {
          if (num > max) return null;
          const isSelected = currentNum === num;
          return (
            <button
              key={num}
              type="button"
              onClick={() => updateCount(num)}
              className={`px-2 py-0.5 rounded-lg text-[11px] font-bold border transition-all ${
                isSelected
                  ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-white'
              }`}
            >
              {num}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PassengerCountInput;
