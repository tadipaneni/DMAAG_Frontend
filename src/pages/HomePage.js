// src/pages/HomePage.js
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Database, Book, Search, Map, Users, History } from 'lucide-react';

export function HomePage({ setCurrentPage }) {
  return (
    <div className="bg-gradient-to-b from-blue-50 to-white min-h-screen">
      <div className="max-w-7xl mx-auto py-12 px-4">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-blue-900 mb-6">
            Data Mining and Mapping Antebellum Georgia
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Preserving and exploring historical data about enslaved individuals in Georgia 
            through an accessible, comprehensive digital platform.
          </p>
        </div>

        {/* Main Collections */}
        <div className="grid md:grid-cols-2 gap-8 mb-16">
          <Card className="hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <CardHeader>
              <Database className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>GSU Records Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Access Georgia State University's comprehensive collection of historical deed records,
                property transactions, and documents that provide insights into the lives of enslaved 
                individuals and their communities.
              </p>
              <button 
                onClick={() => setCurrentPage('gsu')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore GSU Records
              </button>
            </CardContent>
          </Card>

          <Card className="hover:shadow-xl transition-shadow border-t-4 border-blue-600">
            <CardHeader>
              <Book className="h-8 w-8 text-blue-600 mb-2" />
              <CardTitle>Troy Records Collection</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-6">
                Discover Troy University's historical records documenting enslaved individuals,
                transactions, and significant historical events that shaped Antebellum Georgia's
                history and society.
              </p>
              <button 
                onClick={() => setCurrentPage('troy')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Explore Troy Records
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Search className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Advanced Search</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Powerful search functionality to locate specific records, names, 
                locations, and historical events.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Map className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Geographic Mapping</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Interactive ArcGIS mapping tools to visualize historical locations 
                and movement patterns.
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <History className="h-6 w-6 text-blue-600 mb-2" />
              <CardTitle className="text-lg">Data Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Dynamic visualizations to understand historical trends and patterns 
                in the data.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* About Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>About the DMAAG Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose max-w-none">
              <p className="text-gray-600 mb-4">
                The DMAAG project combines cutting-edge technologies with historical research 
                to create a comprehensive digital archive. Using PostgreSQL for database management, 
                GraphQL for API development, React.js for frontend, and ArcGIS for geographic mapping, 
                we're building a platform that makes historical data accessible to everyone.
              </p>
              <p className="text-gray-600">
                Our mission is to preserve and present historical data in a modern, accessible format, 
                enabling researchers, historians, genealogists, and the public to explore and understand 
                the lives of enslaved individuals in Georgia during the Antebellum period.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Target Users Section */}
        <Card>
          <CardHeader>
            <Users className="h-6 w-6 text-blue-600 mb-2" />
            <CardTitle>Who Can Benefit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <h3 className="font-semibold mb-2">Researchers & Historians</h3>
                <p className="text-gray-600">Access comprehensive historical data and documentation</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Genealogists</h3>
                <p className="text-gray-600">Trace family histories and connections</p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">General Public</h3>
                <p className="text-gray-600">Explore and learn about historical events and records</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}