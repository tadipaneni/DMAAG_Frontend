// src/pages/VisualizationPage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { BarChart2, Database } from 'lucide-react';

export function VisualizationPage() {
  return (
    <div className="max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Data Visualization</h1>
      
      <p className="text-gray-600 mb-8">
        Explore visualizations of historical data to understand trends and patterns. 
        Choose a dataset below to view detailed visualizations.
      </p>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* GSU Visualization Card */}
        <Link to="/visualization/gsu">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center">
                <Database className="h-6 w-6 text-blue-600 mr-2" />
                <CardTitle>GSU Records Visualization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Explore transaction patterns, county distribution, and historical trends in the GSU Records dataset.
              </p>
              <div className="flex justify-end">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>View Dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        {/* Troy Visualization Card */}
        <Link to="/visualization/troy">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center">
                <Database className="h-6 w-6 text-blue-600 mr-2" />
                <CardTitle>Troy Records Visualization</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Analyze enslaved persons data, transaction types, and geographical patterns in the Troy Records dataset.
              </p>
              <div className="flex justify-end">
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  <span>View Dashboard</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}