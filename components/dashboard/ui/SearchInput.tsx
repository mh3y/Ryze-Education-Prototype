/**
 * SearchInput — controlled search box used above data tables.
 */

import React from 'react';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'Search…',
  className = '',
}) => (
  <div className={`relative ${className}`}>
    <Search
      size={15}
      className="absolute left-3.5 top-1/2 -translate-y-1/2 ryze-text-muted pointer-events-none"
    />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full pl-10 pr-9 py-2.5 ryze-search__input"
    />
    {value && (
      <button
        onClick={() => onChange('')}
        className="absolute right-3 top-1/2 -translate-y-1/2 ryze-text-muted hover:ryze-text-inverse transition-colors"
        aria-label="Clear search"
      >
        <X size={14} />
      </button>
    )}
  </div>
);
