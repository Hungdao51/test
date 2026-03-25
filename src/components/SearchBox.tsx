import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Location } from '../types';
import { MapPin, Loader2 } from 'lucide-react';

interface Props {
  placeholder: string;
  onSelect: (loc: Location | null) => void;
  value: Location | null;
}

export default function SearchBox({ placeholder, onSelect, value }: Props) {
  const [query, setQuery] = useState(value?.display_name || '');
  const [results, setResults] = useState<Location[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (value) {
      setQuery(value.display_name);
    } else {
      setQuery('');
    }
  }, [value]);

  const handleSearch = async (text: string) => {
    setQuery(text);
    if (!text.trim()) {
      setResults([]);
      setShowDropdown(false);
      onSelect(null);
      return;
    }

    setLoading(true);
    setShowDropdown(true);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      try {
        const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
          params: {
            format: 'json',
            q: text,
            limit: 5,
            addressdetails: 1
          }
        });
        setResults(res.data);
      } catch (error) {
        console.error("Search error", error);
      } finally {
        setLoading(false);
      }
    }, 500);
  };

  const handleSelect = (loc: Location) => {
    setQuery(loc.display_name);
    setShowDropdown(false);
    onSelect(loc);
  };

  return (
    <div className="relative w-full">
      <div className="relative flex items-center">
        <MapPin className="absolute left-3 w-5 h-5 text-gray-400" />
        <input
          type="text"
          className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
          placeholder={placeholder}
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => { if (results.length > 0) setShowDropdown(true); }}
        />
        {loading && <Loader2 className="absolute right-3 w-5 h-5 text-gray-400 animate-spin" />}
      </div>

      {showDropdown && results.length > 0 && (
        <ul className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {results.map((res, idx) => (
            <li
              key={idx}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm border-b last:border-0 border-gray-100"
              onClick={() => handleSelect(res)}
            >
              {res.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
