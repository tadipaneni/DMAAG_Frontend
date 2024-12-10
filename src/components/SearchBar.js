// src/components/SearchBar.js
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder || "Search records..."}
        className="pl-10 w-full"
      />
    </div>
  );
}