'use client';

import { useState, useCallback, useEffect } from 'react';
import TrackingForm from './../components/TrackingForm';
import TrackingDisplay from './../components/TrackingDisplay';
import SavedTrackings from './../components/SavedTrackings';
import { UnifiedTrackingInfo, TrackingEvent } from '@/app/api/utils/types';
import { trackShipment, getTrackingHistory } from '@/lib/api';
import { useAuth } from './../components/AuthProvider';
import { showMessage } from './../components/MessageModal';

export default function DashboardPage() {
  const { token, isAuthenticated } = useAuth();
  const [currentTrackingNumber, setCurrentTrackingNumber] = useState<string | null>(null);
  const [trackingInfo, setTrackingInfo] = useState<UnifiedTrackingInfo | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [historyModalOpen, setHistoryModalOpen] = useState(false);
  const [fullHistory, setFullHistory] = useState<TrackingEvent[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);

  const handleTrack = useCallback(async (trackingNumber: string, alias?: string) => {
    setTrackingLoading(true);
    setTrackingError(null);
    setTrackingInfo(null);
    setCurrentTrackingNumber(trackingNumber);

    try {
      const response = await trackShipment(trackingNumber, alias, isAuthenticated ? token : null);
      if (response.data) {
        setTrackingInfo(response.data);
        showMessage('Tracking information retrieved.', 'success');
      } else {
        setTrackingError(response.message || 'Failed to retrieve tracking information.');
        showMessage(response.message || 'Error tracking shipment.', 'error');
      }
    } catch (err: any) {
      console.error('Tracking failed:', err);
      setTrackingError(err.message || 'Unknown error while tracking the shipment.');
      showMessage(err.message || 'Unknown error while tracking the shipment.', 'error');
    } finally {
      setTrackingLoading(false);
    }
  }, [token, isAuthenticated]);

  const handleViewHistory = useCallback(async (trackingNumber: string) => {
    setHistoryModalOpen(true);
    setHistoryLoading(true);
    setHistoryError(null);
    setFullHistory([]);

    try {
      const response = await getTrackingHistory(trackingNumber, isAuthenticated ? token : null);
      if (response.data) {
        setFullHistory(response.data);
        showMessage('Tracking history loaded.', 'info');
      } else {
        setHistoryError(response.message || 'Failed to load tracking history.');
        showMessage(response.message || 'Error loading history.', 'error');
      }
    } catch (err: any) {
      console.error('Failed to fetch full history:', err);
      setHistoryError(err.message || 'Unknown error loading history.');
      showMessage(err.message || 'Unknown error loading history.', 'error');
    } finally {
      setHistoryLoading(false);
    }
  }, [token, isAuthenticated]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentTrackingNumber && !trackingInfo?.isDelivered) {
      interval = setInterval(() => {
        console.log(`Polling for updates on ${currentTrackingNumber}...`);
        handleTrack(currentTrackingNumber);
      }, 60000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [currentTrackingNumber, trackingInfo?.isDelivered, handleTrack]);

  useEffect(() => {
    const lastTracked = localStorage.getItem('lastTrackedNumber');
    if (lastTracked) {
      handleTrack(lastTracked);
    }
  }, [handleTrack]);

  useEffect(() => {
    if (currentTrackingNumber) {
      localStorage.setItem('lastTrackedNumber', currentTrackingNumber);
    }
  }, [currentTrackingNumber]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <TrackingForm onTrack={handleTrack} loading={trackingLoading} />
        {isAuthenticated && (
          <SavedTrackings onSelectTracking={handleTrack} />
        )}
      </div>
      <div className="lg:col-span-2">
        <TrackingDisplay
          trackingInfo={trackingInfo}
          error={trackingError}
          loading={trackingLoading}
          onViewHistory={handleViewHistory}
        />
      </div>

      {historyModalOpen && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto relative">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">Full History for: {currentTrackingNumber}</h3>
            {historyLoading && <p className="text-gray-600">Loading history...</p>}
            {historyError && <p className="text-red-600">{historyError}</p>}
            {!historyLoading && !historyError && fullHistory.length === 0 && (
              <p className="text-gray-500">No history available for this tracking number.</p>
            )}
            {!historyLoading && !historyError && fullHistory.length > 0 && (
              <div className="space-y-4">
                {fullHistory.map((event, index) => (
                  <div key={index} className="relative pl-8 pb-4 border-l-2 border-blue-200">
                    <div className="absolute -left-2 top-0 w-4 h-4 bg-blue-500 rounded-full"></div>
                    <p className="text-gray-800 font-medium">{event.status}</p>
                    <p className="text-sm text-gray-600">{new Date(event.timestamp).toLocaleString()}</p>
                    {event.location && <p className="text-sm text-gray-600">Location: {event.location}</p>}
                    {event.description && <p className="text-sm text-gray-600 italic">{event.description}</p>}
                  </div>
                ))}
              </div>
            )}
            <button
              onClick={() => setHistoryModalOpen(false)}
              className="mt-6 w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150 ease-in-out"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
