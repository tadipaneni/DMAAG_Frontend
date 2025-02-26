import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Search, Download, BarChart2 } from 'lucide-react';
import { DataDashboard } from '../components/DataDashboard';

export function GsuRecordsPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDashboard, setShowDashboard] = useState(false);
  const [filters, setFilters] = useState({
    state: '',
    county: '',
    dateRange: ''
  });
  const [visibleRange, setVisibleRange] = useState({ start: 0, end: 50 });

  const fetchGsuRecords = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:4000/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `
            query {
              gsuRecords(limit: 1500) {
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
  }, []);

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

  const uniqueStates = [...new Set(records.map(r => r.deed_state).filter(Boolean))].sort();
  const uniqueCounties = [...new Set(records.map(r => r.deed_county).filter(Boolean))].sort();

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
    a.download = 'gsu-records.csv';
    a.click();
  };

  const visibleRecords = filteredRecords.slice(visibleRange.start, visibleRange.end);

  return (
    <div className="max-w-full mx-auto py-8 px-4">
      <DataDashboard type="gsu" isVisible={showDashboard} />
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>GSU Records ({filteredRecords.length} entries)</CardTitle>
          <div className="flex space-x-2">
            <Button
              onClick={() => setShowDashboard(!showDashboard)}
              className="flex items-center"
              variant={showDashboard ? "secondary" : "default"}
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
                value={filters.state}
                onChange={(e) => setFilters(f => ({...f, state: e.target.value}))}
                className="w-40"
              >
                <option value="">All States</option>
                {uniqueStates.map(state => (
                  <option key={state} value={state}>{state}</option>
                ))}
              </Select>
              <Select
                value={filters.county}
                onChange={(e) => setFilters(f => ({...f, county: e.target.value}))}
                className="w-40"
              >
                <option value="">All Counties</option>
                {uniqueCounties.map(county => (
                  <option key={county} value={county}>{county}</option>
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller First Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller Last Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Seller State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Guardian</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin First Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin Last Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer First Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer Last Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer County</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Buyer State</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District Lot</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Number</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lot Section</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acres</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deed Link</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {visibleRecords.map((record, index) => (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_state}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_county}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.deed_date}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_firstname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_lastname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_county}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_state}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_administrator_guardian}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_administrator_guardian_firstname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.seller_administrator_guardian_lastname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_firstname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_lastname}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_county}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_state}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_amount}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyer_purchased_county_district_lot}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.number}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.lotnumber_countysection}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.buyerpurchased_acres}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a href={record.deed_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                            View Deed
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{record.Notes}</td>
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