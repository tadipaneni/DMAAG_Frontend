// src/pages/GsuRecordsPage.js
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Search, Download, BarChart2, Filter } from 'lucide-react';

export function GsuRecordsPage({ showDashboard, setShowDashboard }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    county: '',
    dateRange: 'all'
  });
  const [page, setPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchGsuRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              gsuRecords {
                Timestamp
                Email_Address
                deed_state
                deed_county
                deed_date
                seller_firstname
                seller_lastname
                seller_county
                seller_state
                seller_administrator_guardian
                seller_administrator_guardian_firstname
                seller_administrator_guardian_lastname
                buyer_firstname
                buyer_lastname
                buyer_county
                buyer_state
                buyer_amount
                buyer_purchased_county_district_lot
                number
                lotnumber_countysection
                buyerpurchased_acres
                deed_link
                Notes
              }
            }
          `
        })
      });

      const data = await response.json();
      if (data.data && data.data.gsuRecords) {
        setRecords(data.data.gsuRecords);
      }
    } catch (error) {
      console.error('Error fetching GSU records:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGsuRecords();
  }, [page, itemsPerPage]);

  const filteredRecords = records.filter(record => {
    const matchesSearch = searchTerm ? 
      Object.values(record).some(value => 
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ) : true;

    const matchesState = filters.state ? 
      record.deed_state === filters.state : true;

    const matchesCounty = filters.county ? 
      record.deed_county === filters.county : true;

    return matchesSearch && matchesState && matchesCounty;
  });

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
    a.download = 'gsu-records.csv';
    a.click();
  };

  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>GSU Records</CardTitle>
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
                value={filters.state}
                onChange={(e) => setFilters(f => ({...f, state: e.target.value}))}
                className="w-40"
              >
                <option value="">All States</option>
                <option value="GA">Georgia</option>
                <option value="AL">Alabama</option>
              </Select>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredRecords.map((record, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_state}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_county}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {`${record.seller_firstname} ${record.seller_lastname}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {`${record.buyer_firstname} ${record.buyer_lastname}`}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_amount}</td>
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