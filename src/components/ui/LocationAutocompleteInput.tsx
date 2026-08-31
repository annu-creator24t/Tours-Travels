'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Loader2, X, Navigation } from 'lucide-react';

export interface LocationSuggestion {
  id: string;
  mainText: string;
  secondaryText: string;
  description: string;
}

interface LocationAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  id?: string;
  name?: string;
  className?: string;
  icon?: React.ReactNode;
  autoComplete?: string;
}

export const LocationAutocompleteInput: React.FC<LocationAutocompleteInputProps> = ({
  value,
  onChange,
  placeholder = 'Enter city, airport, hotel, or landmark',
  required = false,
  id,
  name,
  className = '',
  icon,
  autoComplete = 'off',
}) => {
  const generatedId = useId();
  const inputId = id || generatedId;
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Debounced API search
  useEffect(() => {
    if (!value || value.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      return;
    }

    // Do not fetch if the dropdown was just closed after a selection
    let isMounted = true;
    setIsLoading(true);

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations/autocomplete?q=${encodeURIComponent(value.trim())}`
        );
        if (res.ok) {
          const json = await res.json();
          if (isMounted && json.success && Array.isArray(json.data)) {
            setSuggestions(json.data);
            setIsOpen(true);
            setHighlightedIndex(-1);
          }
        }
      } catch (err) {
        console.warn('Error fetching location autocomplete:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [value]);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (suggestion: LocationSuggestion) => {
    // Prefer concise, clean representation
    const textToSet = suggestion.description || suggestion.mainText;
    onChange(textToSet);
    setIsOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || suggestions.length === 0) {
      if (e.key === 'ArrowDown' && suggestions.length > 0) {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative flex items-center">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          {icon || <MapPin className="w-4 h-4 text-blue-600" />}
        </div>

        <input
          ref={inputRef}
          id={inputId}
          name={name}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={`w-full pl-10 pr-9 py-2.5 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all shadow-sm ${className}`}
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isLoading && (
            <Loader2 className="w-3.5 h-3.5 text-blue-600 animate-spin" />
          )}
          {!isLoading && value && (
            <button
              type="button"
              onClick={handleClear}
              className="text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100 transition-colors"
              title="Clear input"
              aria-label="Clear location"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden text-xs max-h-64 overflow-y-auto animate-in fade-in slide-in-from-top-1 duration-150 divide-y divide-slate-100">
          {suggestions.length > 0 ? (
            suggestions.map((item, idx) => {
              const isHighlighted = idx === highlightedIndex;
              return (
                <button
                  key={item.id || idx}
                  type="button"
                  onMouseDown={(e) => {
                    e.preventDefault(); // prevents blur before click registers
                    handleSelect(item);
                  }}
                  onMouseEnter={() => setHighlightedIndex(idx)}
                  className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors ${
                    isHighlighted
                      ? 'bg-blue-50/80 text-blue-950'
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="mt-0.5 w-6 h-6 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                    <Navigation className="w-3 h-3 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-slate-900 truncate">
                      {item.mainText}
                    </div>
                    {item.secondaryText && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {item.secondaryText}
                      </div>
                    )}
                  </div>
                </button>
              );
            })
          ) : (
            !isLoading &&
            value.trim().length >= 2 && (
              <div className="px-4 py-3 text-center text-slate-500">
                <span className="text-[11px] block text-slate-600 font-medium">
                  No exact suggestion found
                </span>
                <span className="text-[10px] text-slate-400 block mt-0.5">
                  You can keep your custom typed location: &ldquo;{value}&rdquo;
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocompleteInput;
