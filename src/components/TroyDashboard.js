import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  Cell
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import Papa from 'papaparse';
import _ from 'lodash';

export default function TroyDashboard() {
  // State Management
  const [dashboardData, setDashboardData] = useState({
    transactionsByYear: [],
    locationStats: [],
    enslavedStats: [],
    enslaverStats: [],
    transactionTypeStats: [],
    totalRecords: 0,
    totalValue: 0,
    averageValue: 0,
    uniqueLocations: 0
  });
  const [activeView, setActiveView] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Data Loading and Processing
  useEffect(() => {
    async function loadAndProcessData() {
      try {
        console.log('Loading Troy CSV data...');
        const response = await fetch('/troyrecords.csv');
        const csvText = await response.text();
        
        // Parse CSV
        const parsed = Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          skipEmptyLines: true
        });

        if (!parsed.data || parsed.data.length === 0) {
          throw new Error('No data found in CSV');
        }

        const parsedData = parsed.data;
        console.log('Processing', parsedData.length, 'records');

        // Process Data for Different Views
        
        // Yearly Analysis
        const yearlyData = _.chain(parsedData)
          .groupBy(record => {
            const date = record.trans_record_date ? 
              new Date(record.trans_record_date.toString()).getFullYear() : null;
            return date;
          })
          .map((records, year) => ({
            year: parseInt(year),
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            uniqueEnslaved: _.uniqBy(records, 'enslaved_name').length,
            uniqueEnslavers: _.uniqBy(records, 'enslaver1_name').length
          }))
          .sortBy('year')
          .value()
          .filter(item => !isNaN(item.year));

        // Location Analysis
        const locationStats = _.chain(parsedData)
          .groupBy('trans_loc')
          .map((records, location) => ({
            name: location || 'Unknown',
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            uniqueEnslaved: _.uniqBy(records, 'enslaved_name').length,
            uniqueEnslavers: _.uniqBy(records, 'enslaver1_name').length
          }))
          .value()
          .filter(item => item.name !== 'Unknown' && item.name !== 'null');

        // Transaction Type Analysis
        const transactionTypeStats = _.chain(parsedData)
          .groupBy('trans_type')
          .map((records, type) => ({
            name: type || 'Unknown',
            count: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value()
          .filter(item => item.name !== 'Unknown' && item.name !== 'null');

        // Enslaved Persons Analysis
        const enslavedStats = _.chain(parsedData)
          .groupBy('enslaved_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            roles: _.uniq(records.map(r => r.enslaved_transrole))
          }))
          .filter(person => person.name && person.name.trim() !== '' && person.name !== 'null')
          .sortBy(r => -r.transactions)
          .take(10)
          .value();

        // Enslaver Analysis
        const enslaverStats = _.chain(parsedData)
          .groupBy('enslaver1_name')
          .map((records, name) => ({
            name,
            transactions: records.length,
            totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0),
            locations: _.uniq(records.map(r => r.enslaver1_loc))
          }))
          .filter(enslaver => enslaver.name && enslaver.name.trim() !== '' && enslaver.name !== 'null')
          .sortBy(r => -r.transactions)
          .take(10)
          .value();

        // Overall Statistics
        const totalRecords = parsedData.length;
        const totalValue = _.sumBy(parsedData, record => parseFloat(record.transindv_value) || 0);
        const averageValue = totalRecords > 0 ? totalValue / totalRecords : 0;
        const uniqueLocations = _.uniq(parsedData.map(r => r.trans_loc))
          .filter(loc => loc && loc !== 'null').length;

        // Update Dashboard Data
        setDashboardData({
          transactionsByYear: yearlyData,
          locationStats,
          enslavedStats,
          enslaverStats,
          transactionTypeStats,
          totalRecords,
          totalValue,
          averageValue,
          uniqueLocations
        });

        setLoading(false);
      } catch (error) {
        console.error('Error processing data:', error);
        setError(error.message || 'Error loading dashboard data');
        setLoading(false);
      }
    }

    loadAndProcessData();
  }, []);

  // Utility Functions
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-4 shadow-lg rounded-lg border">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {
                entry.name.includes('Value') 
                  ? `$${entry.value.toLocaleString()}`
                  : entry.value.toLocaleString()
              }
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  // Loading State
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="max-w-7xl mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-red-600">{error}</div>
        </div>
      </div>
    );
  }

  // HERE IS THE WRAPPED RETURN STATEMENT
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Troy Records Dashboard</h1>
        <Link to="/visualization" className="text-blue-600 hover:text-blue-800 flex items-center">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Visualizations
        </Link>
      </div>
      
      <div className="space-y-6 p-6 bg-gray-50 rounded-lg shadow">
        {/* Navigation */}
        <div className="flex gap-2 flex-wrap">
          {['overview', 'locations', 'people', 'transactions'].map((view) => (
            <Button
              key={view}
              onClick={() => setActiveView(view)}
              variant={activeView === view ? "default" : "outline"}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </Button>
          ))}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Records</h3>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.totalRecords.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Total Value</h3>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(dashboardData.totalValue).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Average Value</h3>
              <p className="text-3xl font-bold mt-2">
                ${Math.round(dashboardData.averageValue).toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="pt-6">
              <h3 className="text-lg font-semibold opacity-90">Unique Locations</h3>
              <p className="text-3xl font-bold mt-2">
                {dashboardData.uniqueLocations.toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Overview View */}
        {activeView === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Transaction Types Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.transactionTypeStats}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={150}
                      label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                    >
                      {dashboardData.transactionTypeStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dashboardData.locationStats.slice(0, 10)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="transactions" name="Transactions" fill="#3b82f6" />
                    <Bar dataKey="uniqueEnslaved" name="Unique Enslaved Persons" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Locations View */}
        {activeView === 'locations' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Location Distribution Map */}
            <Card>
              <CardHeader>
                <CardTitle>Location Distribution Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.locationStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={100}
                      interval={0}
                    />
                    <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                    <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="totalValue" 
                      name="Total Value ($)" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="transactions" 
                      name="Number of Transactions" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Location Statistics Table */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Location Statistics</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Enslaved</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unique Enslavers</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {_.orderBy(dashboardData.locationStats, ['transactions'], ['desc'])
                      .map((location, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">{location.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{location.transactions.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${location.totalValue.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{location.uniqueEnslaved}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{location.uniqueEnslavers}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* People View */}
        {activeView === 'people' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Enslaved Persons Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Enslaved Persons Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roles</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.enslavedStats.map((person, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">{person.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{person.transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${person.totalValue.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{person.roles.join(', ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Enslavers Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Enslavers Records</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transactions</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Locations</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {dashboardData.enslaverStats.map((enslaver, index) => (
                        <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                          <td className="px-6 py-4 whitespace-nowrap">{enslaver.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{enslaver.transactions}</td>
                          <td className="px-6 py-4 whitespace-nowrap">${enslaver.totalValue.toLocaleString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{enslaver.locations.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Visualization of People Data */}
            <Card className="col-span-2">
              <CardHeader>
                <CardTitle>Transaction Value Distribution by Person Type</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    ...dashboardData.enslavedStats.slice(0, 5).map(item => ({
                      ...item,
                      type: 'Enslaved'
                    })),
                    ...dashboardData.enslaverStats.slice(0, 5).map(item => ({
                      ...item,
                      type: 'Enslaver'
                    }))
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar dataKey="totalValue" name="Total Value ($)" fill="#3b82f6" />
                    <Bar dataKey="transactions" name="Number of Transactions" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions View */}
        {activeView === 'transactions' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Transaction Types Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types Analysis</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.transactionTypeStats}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      name="Number of Transactions" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="totalValue" 
                      name="Total Value ($)" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Transaction Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Type Details</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Average Value</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {dashboardData.transactionTypeStats.map((type, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">{type.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{type.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${type.totalValue.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          ${Math.round(type.totalValue / type.count).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}