// src/components/Navigation.js
import React from 'react';
import { Database, Search } from 'lucide-react';

export function Navigation({ currentPage, setCurrentPage }) {
  return (
    <nav className="bg-blue-600 text-white sticky top-0 z-50 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16 items-center">
          <button 
            onClick={() => setCurrentPage('home')}
            className="flex items-center space-x-2 hover:text-blue-100 transition-colors"
          >
            <Database className="h-6 w-6" />
            <span className="font-bold text-xl">DMAAG</span>
          </button>
          
          <div className="flex space-x-8">
            <button 
              onClick={() => setCurrentPage('gsu')}
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md ${
                currentPage === 'gsu' ? 'bg-blue-700' : ''
              }`}
            >
              GSU Records
            </button>
            <button 
              onClick={() => setCurrentPage('troy')}
              className={`hover:text-blue-100 transition-colors px-3 py-2 rounded-md ${
                currentPage === 'troy' ? 'bg-blue-700' : ''
              }`}
            >
              Troy Records
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}