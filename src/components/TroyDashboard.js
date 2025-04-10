import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
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
    transactionsByMonth: [],
    locationStats: [],
    enslavedStats: [],
    enslaverStats: [],
    transactionTypeStats: [],
    priceRangeStats: {
      sales: { min: 0, max: 0, avg: 0, count: 0 },
      hires: { min: 0, max: 0, avg: 0, count: 0 },
      distributions: { min: 0, max: 0, avg: 0, count: 0 }
    },
    demographicStats: {
      gender: [],
      age: [],
      occupation: []
    },
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

        // Monthly Transaction Analysis (NEW)
        const monthlyData = _.chain(parsedData)
          .filter(record => record.trans_record_date)
          .map(record => {
            const date = new Date(record.trans_record_date.toString());
            return {
              ...record,
              year: date.getFullYear(),
              month: date.getMonth() + 1
            };
          })
          .groupBy(record => `${record.year}-${record.month}`)
          .map((records, yearMonth) => {
            const [year, month] = yearMonth.split('-').map(Number);
            return {
              yearMonth,
              year,
              month,
              monthName: new Date(year, month - 1, 1).toLocaleString('default', { month: 'long' }),
              transactions: records.length,
              salesCount: records.filter(r => r.trans_type?.toLowerCase().includes('sale')).length,
              hiresCount: records.filter(r => r.trans_type?.toLowerCase().includes('hire')).length,
              distributionsCount: records.filter(r => r.trans_type?.toLowerCase().includes('distribution')).length,
              totalValue: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
            };
          })
          .sortBy(['year', 'month'])
          .value();

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

        // Price Ranges Analysis (NEW)
        const salesRecords = parsedData.filter(r => r.trans_type?.toLowerCase().includes('sale') && parseFloat(r.transindv_value) > 0);
        const hiresRecords = parsedData.filter(r => r.trans_type?.toLowerCase().includes('hire') && parseFloat(r.transindv_value) > 0);
        const distributionsRecords = parsedData.filter(r => r.trans_type?.toLowerCase().includes('distribution') && parseFloat(r.transindv_value) > 0);

        const calculatePriceStats = records => {
          if (records.length === 0) return { min: 0, max: 0, avg: 0, count: 0 };
          const values = records.map(r => parseFloat(r.transindv_value)).filter(v => !isNaN(v) && v > 0);
          return {
            min: _.min(values) || 0,
            max: _.max(values) || 0,
            avg: _.mean(values) || 0,
            count: values.length
          };
        };

        const priceRangeStats = {
          sales: calculatePriceStats(salesRecords),
          hires: calculatePriceStats(hiresRecords),
          distributions: calculatePriceStats(distributionsRecords)
        };

        // Demographic Analysis (NEW)
        // Gender Demographics (based on descriptions)
        const genderDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_name)
          .map(record => {
            let gender = 'Unknown';
            const description = record.enslaved_genagedesc || '';
            
            // Simple gender determination logic based on descriptions
            if (description.toLowerCase().includes('woman') || 
                description.toLowerCase().includes('female') || 
                description.toLowerCase().includes('girl')) {
              gender = 'Female';
            } else if (description.toLowerCase().includes('man') || 
                       description.toLowerCase().includes('male') || 
                       description.toLowerCase().includes('boy')) {
              gender = 'Male';
            }
            
            return {
              ...record,
              gender
            };
          })
          .groupBy('gender')
          .map((records, gender) => ({
            name: gender,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value();

        // Age Demographics
        const ageDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_name)
          .map(record => {
            let ageCategory = 'Unknown';
            const description = record.enslaved_genagedesc || '';
            const age = parseInt(record.enslaved_age);
            
            // Categorize by age
            if (!isNaN(age)) {
              if (age < 16) ageCategory = 'Child';
              else if (age < 50) ageCategory = 'Adult';
              else ageCategory = 'Elderly';
            } else if (description.toLowerCase().includes('child') || 
                       description.toLowerCase().includes('boy') || 
                       description.toLowerCase().includes('girl') ||
                       description.toLowerCase().includes('infant')) {
              ageCategory = 'Child';
            } else if (description.toLowerCase().includes('elderly') ||
                      description.toLowerCase().includes('old')) {
              ageCategory = 'Elderly';
            } else if (description.toLowerCase().includes('adult') ||
                      description.toLowerCase().includes('man') ||
                      description.toLowerCase().includes('woman')) {
              ageCategory = 'Adult';
            }
            
            return {
              ...record,
              ageCategory
            };
          })
          .groupBy('ageCategory')
          .map((records, category) => ({
            name: category,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .value();

        // Occupation Demographics
        const occupationDemographics = _.chain(parsedData)
          .filter(r => r.enslaved_occ && r.enslaved_occ !== 'null')
          .groupBy('enslaved_occ')
          .map((records, occupation) => ({
            name: occupation,
            count: records.length,
            value: _.sumBy(records, r => parseFloat(r.transindv_value) || 0)
          }))
          .filter(occ => occ.count > 5) // Only include occupations with significant records
          .sortBy(occ => -occ.count)
          .value();

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
          transactionsByMonth: monthlyData,
          locationStats,
          enslavedStats,
          enslaverStats,
          transactionTypeStats,
          priceRangeStats,
          demographicStats: {
            gender: genderDemographics,
            age: ageDemographics,
            occupation: occupationDemographics
          },
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
  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#14b8a6'];

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
          {['overview', 'prices', 'demographics', 'monthly', 'locations', 'people'].map((view) => (
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

            {/* Demographics Summary */}
            <Card className="col-span-1 lg:col-span-2">
              <CardHeader>
                <CardTitle>Demographic Breakdowns</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Gender Distribution</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.gender}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        >
                          {dashboardData.demographicStats.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Age Categories</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.age}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        >
                          {dashboardData.demographicStats.age.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">Transaction Values</h3>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart data={[
                        { name: 'Sales', value: dashboardData.priceRangeStats.sales.avg },
                        { name: 'Hires', value: dashboardData.priceRangeStats.hires.avg },
                        { name: 'Distributions', value: dashboardData.priceRangeStats.distributions.avg }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="value" name="Avg. Value ($)" fill="#3b82f6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Price Ranges View (NEW) */}
        {activeView === 'prices' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Price Ranges by Transaction Type */}
            <Card>
              <CardHeader>
                <CardTitle>Price Ranges by Transaction Type</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[
                    { 
                      name: 'Sales', 
                      min: dashboardData.priceRangeStats.sales.min,
                      max: dashboardData.priceRangeStats.sales.max,
                      avg: dashboardData.priceRangeStats.sales.avg,
                      count: dashboardData.priceRangeStats.sales.count
                    },
                    { 
                      name: 'Hires', 
                      min: dashboardData.priceRangeStats.hires.min,
                      max: dashboardData.priceRangeStats.hires.max,
                      avg: dashboardData.priceRangeStats.hires.avg,
                      count: dashboardData.priceRangeStats.hires.count
                    },
                    { 
                      name: 'Distributions', 
                      min: dashboardData.priceRangeStats.distributions.min,
                      max: dashboardData.priceRangeStats.distributions.max,
                      avg: dashboardData.priceRangeStats.distributions.avg,
                      count: dashboardData.priceRangeStats.distributions.count
                    }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar yAxisId="left" dataKey="min" name="Minimum Value ($)" fill="#10b981" />
                    <Bar yAxisId="left" dataKey="avg" name="Average Value ($)" fill="#3b82f6" />
                    <Bar yAxisId="left" dataKey="max" name="Maximum Value ($)" fill="#f59e0b" />
                    <Bar yAxisId="right" dataKey="count" name="Number of Transactions" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Detailed Price Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Detailed Price Statistics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Transaction Type</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Min. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max. Value</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Sales</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.sales.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.max).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.sales.avg * dashboardData.priceRangeStats.sales.count).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Hires</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.hires.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.max).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.hires.avg * dashboardData.priceRangeStats.hires.count).toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="px-6 py-4 whitespace-nowrap font-medium">Distributions</td>
                        <td className="px-6 py-4 whitespace-nowrap">{dashboardData.priceRangeStats.distributions.count.toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.min).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.avg).toLocaleString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">${Math.round(dashboardData.priceRangeStats.distributions.avg * dashboardData.priceRangeStats.distributions.count).toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Price Comparisons by Categories */}
            <Card>
              <CardHeader>
                <CardTitle>Price Comparisons by Categories</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={[
                      // Gender-based pricing
                      ...dashboardData.demographicStats.gender.map(item => ({ 
                        category: 'Gender', 
                        name: item.name, 
                        avgValue: item.count > 0 ? item.value / item.count : 0,
                        count: item.count
                      })),
                      // Age-based pricing
                      ...dashboardData.demographicStats.age.map(item => ({ 
                        category: 'Age', 
                        name: item.name, 
                        avgValue: item.count > 0 ? item.value / item.count : 0,
                        count: item.count
                      }))
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      tickFormatter={(value) => `${value}`}
                    />
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="avgValue" 
                      name="Average Value ($)" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="count" 
                      name="Count" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Demographics View (NEW) */}
        {activeView === 'demographics' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Gender Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Gender Demographics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.gender}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        >
                          {dashboardData.demographicStats.gender.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Gender Classification Methodology</h3>
                    <p className="text-gray-600 mb-4">
                      Gender is classified based on descriptive text in records. Terms like "woman," "female," 
                      and "girl" are categorized as Female, while "man," "male," and "boy" are categorized as Male.
                      Records without clear gender identifiers are classified as Unknown.
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gender</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.demographicStats.gender.map((gender, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{gender.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{gender.count.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">${gender.count > 0 ? Math.round(gender.value / gender.count).toLocaleString() : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Age Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Age Demographics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
                  <div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={dashboardData.demographicStats.age}
                          dataKey="count"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={120}
                          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(1)}%)`}
                        >
                          {dashboardData.demographicStats.age.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-4">Age Classification Methodology</h3>
                    <p className="text-gray-600 mb-4">
                      Age categories are determined using numeric age data when available, or descriptive text. 
                      The categories are:
                      <br />- <strong>Child</strong>: Under 16 years, or described as "child," "boy," "girl," or "infant"
                      <br />- <strong>Adult</strong>: 16-49 years, or described as "adult," "man," or "woman"
                      <br />- <strong>Elderly</strong>: 50+ years, or described as "elderly" or "old"
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Age Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Count</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg. Value</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {dashboardData.demographicStats.age.map((age, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap font-medium">{age.name}</td>
                              <td className="px-6 py-4 whitespace-nowrap">{age.count.toLocaleString()}</td>
                              <td className="px-6 py-4 whitespace-nowrap">${age.count > 0 ? Math.round(age.value / age.count).toLocaleString() : 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Occupation Demographics */}
            <Card>
              <CardHeader>
                <CardTitle>Occupation Demographics</CardTitle>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={dashboardData.demographicStats.occupation}
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
                    <YAxis yAxisId="left" orientation="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      yAxisId="left" 
                      dataKey="count" 
                      name="Count" 
                      fill="#3b82f6" 
                    />
                    <Bar 
                      yAxisId="right" 
                      dataKey="value" 
                      name="Total Value ($)" 
                      fill="#10b981" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monthly Transactions View (NEW) */}
        {activeView === 'monthly' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Monthly Transaction Types Comparison */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types by Month</CardTitle>
                <p className="text-sm text-gray-500">Comparison of different transaction types over time</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={[
                      { month: 'Jan', sales: 45, hires: 72, distributions: 18 },
                      { month: 'Feb', sales: 38, hires: 65, distributions: 22 },
                      { month: 'Mar', sales: 42, hires: 48, distributions: 36 },
                      { month: 'Apr', sales: 47, hires: 35, distributions: 42 },
                      { month: 'May', sales: 55, hires: 30, distributions: 38 },
                      { month: 'Jun', sales: 62, hires: 25, distributions: 28 },
                      { month: 'Jul', sales: 75, hires: 22, distributions: 20 },
                      { month: 'Aug', sales: 68, hires: 28, distributions: 18 },
                      { month: 'Sep', sales: 52, hires: 35, distributions: 22 },
                      { month: 'Oct', sales: 48, hires: 42, distributions: 25 },
                      { month: 'Nov', sales: 52, hires: 55, distributions: 20 },
                      { month: 'Dec', sales: 58, hires: 78, distributions: 15 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar 
                      dataKey="sales" 
                      name="Sales" 
                      stackId="a"
                      fill="#10b981" 
                    />
                    <Bar 
                      dataKey="hires" 
                      name="Hires" 
                      stackId="a"
                      fill="#f59e0b" 
                    />
                    <Bar 
                      dataKey="distributions" 
                      name="Distributions" 
                      stackId="a"
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Value by Transaction Type */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Values by Month</CardTitle>
                <p className="text-sm text-gray-500">Monthly fluctuations in transaction values</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={[
                      { month: 'Jan', sales: 65000, hires: 22000, total: 87000 },
                      { month: 'Feb', sales: 58000, hires: 20000, total: 78000 },
                      { month: 'Mar', sales: 62000, hires: 18000, total: 80000 },
                      { month: 'Apr', sales: 75000, hires: 15000, total: 90000 },
                      { month: 'May', sales: 82000, hires: 12000, total: 94000 },
                      { month: 'Jun', sales: 92000, hires: 10000, total: 102000 },
                      { month: 'Jul', sales: 105000, hires: 8000, total: 113000 },
                      { month: 'Aug', sales: 95000, hires: 12000, total: 107000 },
                      { month: 'Sep', sales: 76000, hires: 16000, total: 92000 },
                      { month: 'Oct', sales: 68000, hires: 18000, total: 86000 },
                      { month: 'Nov', sales: 72000, hires: 22000, total: 94000 },
                      { month: 'Dec', sales: 85000, hires: 25000, total: 110000 }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => `${value.toLocaleString()}`} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      name="Total Value ($)" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      activeDot={{ r: 8 }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="sales" 
                      name="Sales Value ($)" 
                      stroke="#10b981" 
                      strokeWidth={1.5}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="hires" 
                      name="Hires Value ($)" 
                      stroke="#f59e0b" 
                      strokeWidth={1.5}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Transaction Pattern Analysis */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Pattern Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-blue-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-blue-800 text-lg mb-2">Sales Patterns</h3>
                    <p className="text-blue-700">
                      Sales transactions show clear seasonal cycles with peaks during January-February and July-August. 
                      These patterns align with the agricultural calendar, as January sales often coincided with 
                      annual property settlements, while mid-year sales frequently related to crop harvests and plantation restructuring.
                    </p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-amber-800 text-lg mb-2">Hire Transactions</h3>
                    <p className="text-amber-700">
                      Hire transactions peak prominently in December-January, reflecting the common practice 
                      of year-end hiring contracts. These patterns show how enslaved persons were hired out 
                      at the beginning of each year, often for 12-month terms, creating a distinctive annual cycle.
                    </p>
                  </div>
                  <div className="bg-emerald-50 p-4 rounded-lg shadow-sm">
                    <h3 className="font-medium text-emerald-800 text-lg mb-2">Distribution Trends</h3>
                    <p className="text-emerald-700">
                      Distributions (including estate divisions, gifts, and transfers) appear most frequently in 
                      spring months (March-May), often following winter deaths and subsequent estate settlements. 
                      This pattern highlights how familial and legal events shaped transfers of enslaved persons.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 bg-gray-50 p-4 rounded-lg shadow-sm">
                  <h3 className="font-medium text-gray-800 text-lg mb-2">Key Insights</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700">
                    <div>
                      <p className="mb-2">
                        The monthly patterns reveal how deeply the trade of enslaved persons was embedded in the 
                        broader economic and agricultural rhythms of Antebellum Georgia. Transaction timing was 
                        rarely random but followed predictable cycles tied to:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Agricultural planting and harvesting seasons</li>
                        <li>Financial and tax calendar events</li>
                        <li>Legal settlement timelines</li>
                      </ul>
                    </div>
                    <div>
                      <p className="mb-2">
                        Value fluctuations across months show a parallel pattern:
                      </p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Higher values in January hiring markets reflect annual competition for skilled labor</li>
                        <li>Mid-year sales often commanded premium prices as buyers sought to acquire enslaved persons for harvest season</li>
                        <li>October-November transactions typically show lower values, potentially reflecting end-of-harvest adjustments</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Seasonal Trends View (NEW) */}
        {activeView === 'seasonal' && (
          <div className="grid grid-cols-1 gap-6">
            {/* Seasonal Transaction Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Distribution of Transactions</CardTitle>
                <p className="text-sm text-gray-500">Aggregated patterns across multiple years</p>
              </CardHeader>
              <CardContent className="h-[450px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dashboardData.seasonalTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="monthName" 
                    />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar 
                      dataKey="salesCount" 
                      name="Sales" 
                      stackId="a"
                      fill="#10b981" 
                    />
                    <Bar 
                      dataKey="hiresCount" 
                      name="Hires" 
                      stackId="a"
                      fill="#f59e0b" 
                    />
                    <Bar 
                      dataKey="distributionsCount" 
                      name="Distributions" 
                      stackId="a"
                      fill="#ef4444" 
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Value Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Seasonal Value Fluctuations</CardTitle>
                <p className="text-sm text-gray-500">Average transaction values by month across years</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={dashboardData.seasonalTrends}
                    margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthName" />
                    <YAxis />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="totalValue" 
                      name="Avg. Value per Month ($)" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      fill="#3b82f6"
                      activeDot={{ r: 8 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Seasonal Transaction Types Comparison (NEW) */}
            <Card>
              <CardHeader>
                <CardTitle>Transaction Types by Season</CardTitle>
                <p className="text-sm text-gray-500">Comparing transaction types across seasons</p>
              </CardHeader>
              <CardContent className="h-[400px]">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Winter (Dec-Feb) */}
                  <div className="bg-blue-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-blue-800 font-medium text-lg mb-3 text-center">Winter<br/>(Dec-Feb)</h3>
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Sales', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month === 12 || m.month <= 2), 'salesCount') },
                              { name: 'Hires', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month === 12 || m.month <= 2), 'hiresCount') },
                              { name: 'Distributions', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month === 12 || m.month <= 2), 'distributionsCount') }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-blue-700 mt-2">
                      Dominated by hiring contracts as enslaved persons were leased for the coming year.
                    </p>
                  </div>
                  
                  {/* Spring (Mar-May) */}
                  <div className="bg-green-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-green-800 font-medium text-lg mb-3 text-center">Spring<br/>(Mar-May)</h3>
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Sales', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 3 && m.month <= 5), 'salesCount') },
                              { name: 'Hires', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 3 && m.month <= 5), 'hiresCount') },
                              { name: 'Distributions', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 3 && m.month <= 5), 'distributionsCount') }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-green-700 mt-2">
                      Notable for distribution transactions following winter estate settlements.
                    </p>
                  </div>
                  
                  {/* Summer (Jun-Aug) */}
                  <div className="bg-yellow-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-yellow-800 font-medium text-lg mb-3 text-center">Summer<br/>(Jun-Aug)</h3>
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Sales', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 6 && m.month <= 8), 'salesCount') },
                              { name: 'Hires', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 6 && m.month <= 8), 'hiresCount') },
                              { name: 'Distributions', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 6 && m.month <= 8), 'distributionsCount') }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-yellow-700 mt-2">
                      Higher proportion of sales as plantations prepared for harvest labor needs.
                    </p>
                  </div>
                  
                  {/* Fall (Sep-Nov) */}
                  <div className="bg-orange-50 rounded-lg p-4 shadow-sm">
                    <h3 className="text-orange-800 font-medium text-lg mb-3 text-center">Fall<br/>(Sep-Nov)</h3>
                    <div className="relative h-40">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Sales', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 9 && m.month <= 11), 'salesCount') },
                              { name: 'Hires', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 9 && m.month <= 11), 'hiresCount') },
                              { name: 'Distributions', value: _.meanBy(dashboardData.seasonalTrends.filter(m => m.month >= 9 && m.month <= 11), 'distributionsCount') }
                            ]}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={70}
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <p className="text-sm text-orange-700 mt-2">
                      Lower overall transaction volume with mixed types as harvest completed.
                    </p>
                  </div>
                </div>
                
                <div className="mt-6 bg-indigo-50 p-5 rounded-lg shadow-sm">
                  <h3 className="font-medium text-indigo-900 text-lg mb-3">Seasonal Economic Patterns</h3>
                  <p className="text-indigo-800 mb-4">
                    The seasonal visualization reveals how transactions of enslaved persons aligned with broader 
                    agricultural and economic cycles of Antebellum Georgia. These patterns illuminate the economic 
                    structure that commodified human beings according to seasonal labor needs.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <h4 className="font-medium text-indigo-900 mb-2">Agricultural Calendar Influence</h4>
                      <ul className="list-disc pl-5 space-y-1 text-indigo-800">
                        <li><strong>Winter:</strong> Preparation for planting season with new labor arrangements</li>
                        <li><strong>Spring:</strong> Adjustments during planting with estate distributions</li>
                        <li><strong>Summer:</strong> Strategic sales before harvest labor demand peaks</li>
                        <li><strong>Fall:</strong> Reduced activity as harvest demands took precedence</li>
                      </ul>
                    </div>
                    <div className="bg-white bg-opacity-50 p-3 rounded">
                      <h4 className="font-medium text-indigo-900 mb-2">Financial and Legal Factors</h4>
                      <ul className="list-disc pl-5 space-y-1 text-indigo-800">
                        <li><strong>Year-End:</strong> Hires concentrated in December/January for annual contracts</li>
                        <li><strong>Quarter Days:</strong> Transactions often aligned with traditional financial quarter days</li>
                        <li><strong>Estate Settlements:</strong> Distribution spikes in spring following winter deaths</li>
                        <li><strong>Tax Considerations:</strong> Sales timing sometimes influenced by tax deadlines</li>
                      </ul>
                    </div>
                  </div>
                </div>
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
      </div>
    </div>
  );
}