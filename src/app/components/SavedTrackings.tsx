'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from './AuthProvider';
import { getApi } from '@/lib/api';
import { showMessage } from './MessageModal';

interface SavedTrackingItem {
  id: string;
  trackingNumber: string;
  carrier: string;
  alias?: string;
  createdAt: string;
  updatedAt: string;
}

interface SavedTrackingsProps {
  onSelectTracking: (trackingNumber: string) => void;
}

const SavedTrackings: React.FC<SavedTrackingsProps> = ({ onSelectTracking }) => {
  const { userId, token, isAuthenticated } = useAuth();
  const [savedTrackings, setSavedTrackings] = useState<SavedTrackingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavedTrackings = async () => {
    if (!isAuthenticated || !userId || !token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const mockSavedData: SavedTrackingItem[] = [
        {
          id: 's1',
          trackingNumber: '1Z9999999999999999',
          carrier: 'UPS',
          alias: 'My Laptop',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 's2',
          trackingNumber: '9400100000000000000000',
          carrier: 'USPS',
          alias: 'Textbook',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: 's3',
          trackingNumber: '9400100000000112212111',
          carrier: 'USPS',
          alias: 'Desk',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ];
      setSavedTrackings(mockSavedData);
    } catch (err: any) {
      console.error('Failed to fetch saved trackings:', err);
      setError(err.message || 'Failed to load saved trackings.');
      showMessage(err.message || 'Failed to load saved trackings.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedTrackings();
  }, [isAuthenticated, userId, token]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">My Saved Trackings</h2>
      {loading && <p className="text-gray-600">Loading saved trackings...</p>}
      {error && <p className="text-red-600">{error}</p>}
      {!loading && !error && savedTrackings.length === 0 && (
        <p className="text-gray-500">You don’t have any saved trackings yet.</p>
      )}
      <div className="space-y-3">
        {savedTrackings.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between p-3 border border-gray-200 rounded-md bg-gray-50 hover:bg-gray-100 cursor-pointer transition-colors duration-200"
            onClick={() => onSelectTracking(item.trackingNumber)}
          >
            <div>
              <p className="font-semibold text-gray-800">{item.alias || item.trackingNumber}</p>
              <p className="text-sm text-gray-600">{item.carrier} - {item.trackingNumber}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                showMessage(`Delete/edit functionality for ${item.alias || item.trackingNumber} is not implemented.`, 'info');
              }}
              className="ml-4 text-red-500 hover:text-red-700 focus:outline-none"
              title="Delete tracking"
            >
              🗑️
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedTrackings;
