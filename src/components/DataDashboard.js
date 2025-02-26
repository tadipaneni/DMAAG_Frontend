// src/components/DataDashboard.js
import React from 'react';
import { GsuDashboard } from './GsuDashboard';

import { Card } from './ui/card';

export function DataDashboard({ type, isVisible }) {
  if (!isVisible) return null;

  return (
    <Card className="mb-6 bg-white shadow-lg rounded-lg overflow-hidden">
      {type === 'gsu' && <GsuDashboard />}
    {/* Updated this line */}
    </Card>
  );
}