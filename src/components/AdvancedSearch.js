
// src/components/AdvancedSearch.js
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Download, Filter } from 'lucide-react';

export function AdvancedSearch({ type, onSearch, onExport }) {
  const [filters, setFilters] = useState({});
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const gsuFields = [
    { name: 'state', label: 'State', type: 'select', options: [
      { value: 'GA', label: 'Georgia' },
      { value: 'AL', label: 'Alabama' }
    ]},
    { name: 'county', label: 'County', type: 'input' },
    { name: 'date', label: 'Date', type: 'date' }
  ];

  const troyFields = [
    { name: 'enslaved_name', label: 'Enslaved Person', type: 'input' },
    { name: 'location', label: 'Location', type: 'input' },
    { name: 'trans_type', label: 'Transaction Type', type: 'select', options: [
      { value: 'sale', label: 'Sale' },
      { value: 'transfer', label: 'Transfer' }
    ]}
  ];

  const fields = type === 'gsu' ? gsuFields : troyFields;

  const handleSearch = () => {
    onSearch({ ...filters, dateRange });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Advanced Search</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {fields.map(field => (
            <div key={field.name}>
              <label className="block text-sm font-medium mb-1">{field.label}</label>
              {field.type === 'select' ? (
                <Select
                  value={filters[field.name]}
                  onValueChange={(value) => setFilters(f => ({...f, [field.name]: value}))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(opt => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  type={field.type}
                  value={filters[field.name] || ''}
                  onChange={(e) => setFilters(f => ({...f, [field.name]: e.target.value}))}
                />
              )}
            </div>
          ))}
        </div>
        
        <div className="flex justify-between">
          <div className="space-x-2">
            <Button onClick={handleSearch} className="bg-blue-600 hover:bg-blue-700">
              Search
            </Button>
            <Button onClick={onExport} className="bg-green-600 hover:bg-green-700">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
          <Button 
            variant="outline" 
            onClick={() => setFilters({})}
          >
            <Filter className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}