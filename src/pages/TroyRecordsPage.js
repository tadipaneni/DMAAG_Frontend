// src/pages/TroyRecordsPage.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Button } from '../components/ui/button';
import { Search, Download, BarChart2 } from 'lucide-react';

export function TroyRecordsPage({ showDashboard, setShowDashboard }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    enslaved_name: '',
    enslaver_name: '',
    location: '',
    dateRange: 'all'
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchTroyRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              troyRecords {
                rec_number
                source_pg
                source_fr
                enslaved_name
                enslaved_transrole
                enslaved_color
                enslaved_genagedesc
                enslaved_age
                enslaved_decage
                enslaved_est_birth
                enslaved_est_death
                enslaved_occ
                enslaved_health
                enslaved_unkchild
                enslaved_famno
                enslaved_famrel
                enslaver_business
                enslaver_businessrole
                enslaver_businessloc
                enslaver1_name
                enslaver1_trans_role
                enslaver1_loc
                enslaver2_name
                enslaver2_trans_role
                enslaver2_loc
                enslaver3_name
                enslaver3_trans_role
                enslaver3_loc
                enslaver4_name
                enslaver4_trans_role
                enslaver4_loc
                enslaver5_name
                enslaver5_trans_role
                enslaver5_loc
                enslaver6_name
                enslaver6_trans_role
                enslaver6_loc
                enslaver7_name
                enslaver7_trans_role
                enslaver7_loc
                trans_id
                trans_loc
                trans_type
                trans_record_date
                trans_begin_date
                trans_end_date
                transindv_value
                transgrp_value
                source_author
                source_title
                source_loc
                source_film_no
                url
                extractor
                url_1
                notes
              }
            }
          `
        })
      });

      const data = await response.json();
      if (data.data && data.data.troyRecords) {
        setRecords(data.data.troyRecords);
      }
    } catch (error) {
      console.error('Error fetching Troy records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTroyRecords();
  }, [page, itemsPerPage]);

  const filteredRecords = records.filter(record => {
    if (searchTerm) {
      const searchFields = [
        record.enslaved_name,
        record.enslaver1_name,
        record.trans_loc,
        record.rec_number
      ].map(field => (field || '').toLowerCase());
      
      const searchLower = searchTerm.toLowerCase();
      if (!searchFields.some(field => field.includes(searchLower))) {
        return false;
      }
    }

    if (filters.enslaved_name && !record.enslaved_name?.toLowerCase().includes(filters.enslaved_name.toLowerCase())) {
      return false;
    }

    if (filters.enslaver_name && !record.enslaver1_name?.toLowerCase().includes(filters.enslaver_name.toLowerCase())) {
      return false;
    }

    if (filters.location && !record.trans_loc?.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    return true;
  });

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Troy Records</CardTitle>
            <div className="flex space-x-2">
              <Button
                onClick={() => setShowDashboard(!showDashboard)}
                variant="outline"
              >
                <BarChart2 className="w-4 h-4 mr-2" />
                {showDashboard ? 'Hide' : 'Show'} Dashboard
              </Button>
              <Button 
                onClick={() => {
                  // Export functionality
                  const csv = [
                    Object.keys(records[0] || {}).join(','),
                    ...filteredRecords.map(record => 
                      Object.values(record).map(value => `"${value || ''}""`).join(',')
                    )
                  ].join('\n');

                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'troy-records.csv';
                  a.click();
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export Data
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Search records..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select
                value={filters.location}
                onChange={(e) => setFilters(f => ({...f, location: e.target.value}))}
                className="w-48"
              >
                <option value="">All Locations</option>
                {/* Add location options */}
              </Select>
            </div>

            {/* Records Table */}
            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rec #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{record.rec_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_transrole}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_record_date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
