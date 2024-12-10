import React, { useState, useEffect } from 'react';
import { Navigation } from './components/Navigation';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { GsuRecordsPage } from './pages/GsuRecordsPage';
import { TroyRecordsPage } from './pages/TroyRecordsPage';
import { DataDashboard } from './components/DataDashboard';

export default function App() {
  const [currentPage, setCurrentPage] = useState('home');
  const [showDashboard, setShowDashboard] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Test database connection
    fetch('http://localhost:4000/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `query { gsuRecords(limit: 1) { deed_state } }`
      })
    })
      .then(res => res.json())
      .then(() => {
        setIsConnected(true);
        setIsLoading(false);
      })
      .catch(err => {
        console.error('Connection Error:', err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <div>Loading DMAAG...</div>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl text-red-600 mb-4">Connection Error</h1>
          <p className="text-gray-600">Unable to connect to the database. Please try again later.</p>
        </div>
      </div>
    );
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage setCurrentPage={setCurrentPage} />;
      case 'gsu':
        return (
          <>
            {showDashboard && <DataDashboard type="gsu" isVisible={showDashboard} />}
            <GsuRecordsPage showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
          </>
        );
      case 'troy':
        return (
          <>
            {showDashboard && <DataDashboard type="troy" isVisible={showDashboard} />}
            <TroyRecordsPage showDashboard={showDashboard} setShowDashboard={setShowDashboard} />
          </>
        );
      default:
        return <HomePage setCurrentPage={setCurrentPage} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navigation currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="flex-grow">
        {renderPage()}
      </main>
      <Footer />
    </div>
  );
}