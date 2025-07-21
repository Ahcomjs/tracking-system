'use client';

import React from 'react';
import { UnifiedTrackingInfo, TrackingEvent } from '@/app/api/utils/types';

interface TrackingDisplayProps {
  trackingInfo: UnifiedTrackingInfo | null;
  error: string | null;
  loading: boolean;
  onViewHistory: (trackingNumber: string) => void;
}

const TrackingDisplay: React.FC<TrackingDisplayProps> = ({ trackingInfo, error, loading, onViewHistory }) => {
  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-center h-48">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg text-gray-600">Fetching tracking information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative" role="alert">
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline ml-2">{error}</span>
      </div>
    );
  }

  if (!trackingInfo) {
    return (
      <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
        <p>Enter a tracking number to get started.</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    const lowerStatus = status.toLowerCase();
    if (lowerStatus.includes('delivered')) return 'bg-green-500';
    if (lowerStatus.includes('out for delivery')) return 'bg-yellow-500';
    if (lowerStatus.includes('exception') || lowerStatus.includes('failed')) return 'bg-red-500';
    return 'bg-blue-500';
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Tracking Details</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <p className="text-sm text-gray-600">Tracking Number:</p>
          <p className="font-bold text-lg">{trackingInfo.trackingNumber}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Carrier:</p>
          <p className="font-bold text-lg">{trackingInfo.carrier}</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Current Status:</p>
          <span className={`inline-block px-3 py-1 rounded-full text-white font-semibold text-sm ${getStatusColor(trackingInfo.currentStatus)}`}>
            {trackingInfo.currentStatus}
          </span>
        </div>
        {trackingInfo.estimatedDelivery && (
          <div>
            <p className="text-sm text-gray-600">Estimated Delivery:</p>
            <p className="font-bold text-lg">{new Date(trackingInfo.estimatedDelivery).toLocaleDateString()}</p>
          </div>
        )}
        <div>
          <p className="text-sm text-gray-600">Last Updated:</p>
          <p className="font-bold text-lg">{new Date(trackingInfo.lastUpdated).toLocaleString()}</p>
        </div>
      </div>

      <h3 className="text-xl font-semibold mb-3 text-gray-800">Tracking History</h3>
      {trackingInfo.trackingEvents.length > 0 ? (
        <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
          {trackingInfo.trackingEvents.map((event, index) => (
            <div key={index} className="relative pl-8 pb-4 border-l-2 border-blue-200">
              <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
              <p className="text-gray-800 font-medium">{event.status}</p>
              <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
              {event.location && <p className="text-sm text-gray-600">Location: {event.location}</p>}
              {event.description && <p className="text-sm text-gray-600 italic">{event.description}</p>}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500">No tracking history events available.</p>
      )}

      <button
        onClick={() => onViewHistory(trackingInfo.trackingNumber)}
        className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
      >
        View Full History
      </button>
    </div>
  );
};

export default TrackingDisplay;
