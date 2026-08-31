'use client';

import React, { useState, useEffect, useRef, useId } from 'react';
import { MapPin, Loader2, X, Navigation, AlertCircle } from 'lucide-react';

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
  const latestQueryRef = useRef<string>('');

  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number>(-1);

  // Debounced API search with AbortController to prevent race conditions
  useEffect(() => {
    const trimmedValue = value ? value.trim() : '';
    latestQueryRef.current = trimmedValue;

    if (trimmedValue.length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      setIsLoading(false);
      setHasError(false);
      return;
    }

    setIsLoading(true);
    setHasError(false);

    const abortController = new AbortController();

    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(
          `/api/locations/autocomplete?q=${encodeURIComponent(trimmedValue)}`,
          {
            signal: abortController.signal,
            headers: { Accept: 'application/json' },
          }
        );

        // Discard response if query changed or request was aborted
        if (abortController.signal.aborted || latestQueryRef.current !== trimmedValue) {
          return;
        }

        if (res.ok) {
          const json = await res.json();
          if (json.success && Array.isArray(json.data)) {
            setSuggestions(json.data);
            setIsOpen(true);
            setHighlightedIndex(-1);
            setHasError(false);
          } else {
            setSuggestions([]);
            setIsOpen(true);
          }
        } else {
          setHasError(true);
          setSuggestions([]);
          setIsOpen(true);
        }
      } catch (err: any) {
        if (err?.name !== 'AbortError') {
          console.warn('LocationIQ autocomplete fetch error:', err);
          if (latestQueryRef.current === trimmedValue) {
            setHasError(true);
            setSuggestions([]);
            setIsOpen(true);
          }
        }
      } finally {
        if (!abortController.signal.aborted && latestQueryRef.current === trimmedValue) {
          setIsLoading(false);
        }
      }
    }, 280);

    return () => {
      abortController.abort();
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
    // Populate the field with the clear location description or main text
    const textToSet = suggestion.description || suggestion.mainText;
    onChange(textToSet);
    setIsOpen(false);
    setSuggestions([]);
    setHasError(false);
    inputRef.current?.focus();
  };

  const handleClear = () => {
    onChange('');
    setSuggestions([]);
    setIsOpen(false);
    setHasError(false);
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
            if (suggestions.length > 0 || (value && value.trim().length >= 2)) {
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
            <>
              <div>
                {suggestions.map((item, idx) => {
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
                      className={`w-full text-left px-3.5 py-2.5 flex items-start gap-2.5 transition-colors border-b border-slate-50 last:border-b-0 ${
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
                })}
              </div>

              {/* LocationIQ Attribution */}
              <div className="px-3.5 py-1.5 bg-slate-50/80 flex items-center justify-between text-[10px] text-slate-400 select-none">
                <span>Location suggestions</span>
                <a
                  href="https://locationiq.com/?ref=autocomplete"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-slate-400 hover:text-blue-600 font-medium transition-colors"
                  tabIndex={-1}
                  onClick={(e) => e.stopPropagation()}
                >
                  Search by LocationIQ
                </a>
              </div>
            </>
          ) : hasError ? (
            <div className="p-3">
              <div className="flex items-center gap-2 text-amber-700 bg-amber-50 px-3 py-2 rounded-xl text-[11px]">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                <span>Search service unavailable. You can enter location manually.</span>
              </div>
            </div>
          ) : (
            !isLoading &&
            value.trim().length >= 2 && (
              <>
                <div className="px-4 py-3 text-center text-slate-500">
                  <span className="text-[11px] block text-slate-600 font-medium">
                    No matching location found
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Manual entry supported: &ldquo;{value}&rdquo;
                  </span>
                </div>
                <div className="px-3.5 py-1.5 bg-slate-50/80 flex items-center justify-end text-[10px] text-slate-400 select-none">
                  <a
                    href="https://locationiq.com/?ref=autocomplete"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-600 font-medium transition-colors"
                    tabIndex={-1}
                    onClick={(e) => e.stopPropagation()}
                  >
                    Search by LocationIQ
                  </a>
                </div>
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};

export default LocationAutocompleteInput;
