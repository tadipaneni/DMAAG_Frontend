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
    trans_type: ''
  });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const fetchTroyRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              troyRecords(limit: 7000) {
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
  }, []);

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm ? 
      Object.values(record).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;

    const matchesEnslavedName = filters.enslaved_name ? 
      record.enslaved_name?.toLowerCase().includes(filters.enslaved_name.toLowerCase()) : true;

    const matchesEnslaverName = filters.enslaver_name ? 
      record.enslaver1_name?.toLowerCase().includes(filters.enslaver_name.toLowerCase()) : true;

    const matchesLocation = filters.location ? 
      record.trans_loc?.toLowerCase().includes(filters.location.toLowerCase()) : true;

    const matchesTransType = filters.trans_type ? 
      record.trans_type === filters.trans_type : true;

    return matchesSearch && matchesEnslavedName && matchesEnslaverName && 
           matchesLocation && matchesTransType;
  });

  const uniqueLocations = [...new Set(records.map(r => r.trans_loc).filter(Boolean))];
  const uniqueTransTypes = [...new Set(records.map(r => r.trans_type).filter(Boolean))];

  const handleTableScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const bottomThreshold = 100;
    
    if (scrollHeight - scrollTop - clientHeight < bottomThreshold) {
      setVisibleRange(prev => ({
        start: prev.start,
        end: Math.min(prev.end + 50, filteredRecords.length)
      }));
    }
  };

  const exportData = () => {
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
  };

  const visibleRecords = filteredRecords.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Troy Records ({filteredRecords.length} entries)</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowDashboard(!showDashboard)}
              className="flex items-center"
            >
              <BarChart2 className="w-4 h-4 mr-2" />
              {showDashboard ? 'Hide' : 'Show'} Dashboard
            </Button>
            <Button onClick={exportData} className="flex items-center">
              <Download className="w-4 h-4 mr-2" />
              Export Data
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            <div className="flex gap-4 flex-wrap">
              <div className="flex-1 relative min-w-[200px]">
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
                {uniqueLocations.map(location => (
                  <option key={location} value={location}>{location}</option>
                ))}
              </Select>
              <Select
                value={filters.trans_type}
                onChange={(e) => setFilters(f => ({...f, trans_type: e.target.value}))}
                className="w-48"
              >
                <option value="">All Transaction Types</option>
                {uniqueTransTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div 
                className="overflow-x-auto max-h-[70vh] overflow-y-auto"
                onScroll={handleTableScroll}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record #</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Page</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source FR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaved Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trans Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Color</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gen Age Desc</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dec Age</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est Birth</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Est Death</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Occupation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unknown Child</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Family Relation</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver Business</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business Location</th>
                      {/* Enslaver 1 */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 1 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 1 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 1 Location</th>
                      {/* Enslaver 2 */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 2 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 2 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 2 Location</th>
                      {/* Enslaver 3 */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 3 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 3 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 3 Location</th>
                      {/* Enslaver 4-7 headers similarly structured */}
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trans ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Record Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Begin Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">End Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Individual Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Author</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Title</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Film No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 4 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 4 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 4 Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 5 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 5 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 5 Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 6 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 6 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 6 Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 7 Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 7 Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enslaver 7 Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Extractor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL 1</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{record.rec_number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_pg}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_fr}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_transrole}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_color}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_genagedesc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_age}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_decage}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_est_birth}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_est_death}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_occ}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_health}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_unkchild}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_famno}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaved_famrel}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver_business}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver_businessrole}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver_businessloc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver1_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver1_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver1_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver2_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver2_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver2_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver3_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver3_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver3_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver4_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver4_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver4_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver5_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver5_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver5_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver6_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver6_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver6_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver7_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver7_trans_role}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.enslaver7_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_id}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_type}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_record_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_begin_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.trans_end_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.transindv_value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.transgrp_value}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_author}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_title}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_loc}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.source_film_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={record.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View URL
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.extractor}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={record.url_1} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View URL 1
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.notes}</td>
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