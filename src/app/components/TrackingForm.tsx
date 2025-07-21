'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import { showMessage } from './MessageModal';

interface TrackingFormProps {
  onTrack: (trackingNumber: string, alias?: string) => void;
  loading: boolean;
}

const carrierPatterns = {
  UPS: /^1Z[0-9A-Z]{16}$/,
  FedEx: /^(\d{12}|\d{14}|\d{20}|\d{22}|\d{34})$/, 
  USPS: /^(9400|9205|9361)\d{18}$|^[A-Z]{2}\d{9}[A-Z]{2}$|^420\d{27,30}$/,
  DHL: /^(3S|JV|JD)?\d{8,9}$|^\d{10,11}$/,
  AmazonLogistics: /^TBA\d{12}$/,
  OnTrac: /^C\d{8}$/,
};

const cleanTrackingNumber = (num: string) => num.replace(/\s/g, '');

const trackingSchema = z.object({
  trackingNumber: z.string()
    .min(1, 'Tracking number is required.')
    .transform(cleanTrackingNumber)
    .refine(
      (val) => {
        return Object.values(carrierPatterns).some(pattern => pattern.test(val));
      },
      {
        message: 'Invalid tracking number format for any known carrier. Please double-check the number.',
      }
    ),
  alias: z.string().optional(),
});

const TrackingForm: React.FC<TrackingFormProps> = ({ onTrack, loading }) => {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [alias, setAlias] = useState('');
  const [errors, setErrors] = useState<{ trackingNumber?: string }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      const validatedData = trackingSchema.parse({ trackingNumber, alias: alias || undefined });
      onTrack(validatedData.trackingNumber, validatedData.alias);
    } catch (error) {
      if (error instanceof z.ZodError) {
        const fieldErrors: { trackingNumber?: string } = {};
        error.issues.forEach(err => {
          if (err.path.includes('trackingNumber')) {
            fieldErrors.trackingNumber = err.message;
          }
        });
        setErrors(fieldErrors);
        showMessage(fieldErrors.trackingNumber || 'Validation error. Please check the fields.', 'error');
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-6">
      <h2 className="text-2xl font-semibold mb-4 text-gray-800">Track a New Shipment</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="trackingNumber" className="block text-sm font-medium text-gray-700 mb-1">
            Tracking Number
          </label>
          <input
            type="text"
            id="trackingNumber"
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm ${
              errors.trackingNumber ? 'border-red-500' : 'border-gray-300'
            }`}
            placeholder="Enter your tracking number"
            value={trackingNumber}
            onChange={(e) => {
              setTrackingNumber(e.target.value);
              if (errors.trackingNumber) setErrors({});
            }}
            required
          />
          {errors.trackingNumber && <p className="mt-1 text-sm text-red-600">{errors.trackingNumber}</p>}
        </div>
        <div>
          <label htmlFor="alias" className="block text-sm font-medium text-gray-700 mb-1">
            Alias (Optional)
          </label>
          <input
            type="text"
            id="alias"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="e.g., My Amazon Package"
            value={alias}
            onChange={(e) => setAlias(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Tracking...' : 'Track Shipment'}
        </button>
      </form>
    </div>
  );
};

export default TrackingForm;
