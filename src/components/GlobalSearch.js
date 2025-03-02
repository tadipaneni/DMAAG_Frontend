// Add this component to src/components/GlobalSearch.js
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';

export function GlobalSearch({ onSearch }) {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = () => {
    onSearch(searchTerm);
  };

  return (
    <div className="max-w-xl mx-auto mb-6">
      <div className="flex items-center gap-2 bg-white p-2 rounded-lg shadow">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input 
            type="text" 
            placeholder="Search across all records..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="pl-10"
          />
        </div>
        <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
          Search All
        </Button>
      </div>
    </div>
  );
}