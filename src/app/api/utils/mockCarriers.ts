import { UnifiedTrackingInfo, TrackingEvent } from './types';
import { Carrier } from './carriers';

/**
 * @param trackingNumber The UPS tracking number.
 * @returns Unified tracking information.
 */
export async function fetchUpsTracking(trackingNumber: string): Promise<UnifiedTrackingInfo> {
  console.log(`Simulating UPS tracking for: ${trackingNumber}`);
  await new Promise(resolve => setTimeout(resolve, 500));

  if (trackingNumber === '1Z9999999999999999') {
    return {
      trackingNumber,
      carrier: 'UPS',
      currentStatus: 'Delivered',
      estimatedDelivery: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      trackingEvents: [
        { status: 'Delivered', location: 'Santo Domingo, DO', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), description: 'Delivered to front door' },
        { status: 'Out for Delivery', location: 'Santo Domingo, DO', timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString() },
        { status: 'In Transit', location: 'Miami, FL', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), description: 'Departed from UPS facility' },
        { status: 'Origin Scan', location: 'Atlanta, GA', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: true,
    };
  } else if (trackingNumber === '1ZABCDEF1234567890') {
    return {
      trackingNumber,
      carrier: 'UPS',
      currentStatus: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      trackingEvents: [
        { status: 'In Transit', location: 'Dallas, TX', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), description: 'Arrived at UPS facility' },
        { status: 'Origin Scan', location: 'Los Angeles, CA', timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    };
  } else if (trackingNumber.includes('ERROR')) {
    return {
      trackingNumber,
      carrier: 'UPS',
      currentStatus: 'Exception',
      trackingEvents: [],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
      error: 'Tracking number not found or invalid for UPS.',
    };
  } else {
    return {
      trackingNumber,
      carrier: 'UPS',
      currentStatus: 'Pre-Shipment',
      trackingEvents: [
        { status: 'Label Created', location: 'Sender Location', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    };
  }
}

/**
 * @param trackingNumber The USPS tracking number.
 * @returns Unified tracking information.
 */
export async function fetchUspsTracking(trackingNumber: string): Promise<UnifiedTrackingInfo> {
  console.log(`Simulating USPS tracking for: ${trackingNumber}`);
  await new Promise(resolve => setTimeout(resolve, 600));

  if (trackingNumber === '9400100000000000000000') {
    return {
      trackingNumber,
      carrier: 'USPS',
      currentStatus: 'Delivered',
      estimatedDelivery: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
      trackingEvents: [
        { status: 'Delivered', location: 'New York, NY', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), description: 'Delivered to mailbox' },
        { status: 'Out for Delivery', location: 'New York, NY', timestamp: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString() },
        { status: 'In Transit', location: 'Philadelphia, PA', timestamp: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: true,
    };
  } else if (trackingNumber === 'RR123456789US') {
    return {
      trackingNumber,
      carrier: 'USPS',
      currentStatus: 'In Transit',
      estimatedDelivery: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
      trackingEvents: [
        { status: 'Arrived at USPS Facility', location: 'Chicago, IL', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
        { status: 'Accepted at USPS Origin Facility', location: 'San Francisco, CA', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    };
  } else if (trackingNumber.includes('INVALID')) {
    return {
      trackingNumber,
      carrier: 'USPS',
      currentStatus: 'Exception',
      trackingEvents: [],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
      error: 'Tracking number not found or invalid for USPS.',
    };
  } else {
    return {
      trackingNumber,
      carrier: 'USPS',
      currentStatus: 'Pre-Shipment',
      trackingEvents: [
        { status: 'Shipping Label Created, USPS Awaiting Item', location: 'Sender Location', timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString() },
      ],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    };
  }
}

/**
 * @param trackingNumber The tracking number.
 * @param carrier The carrier name.
 * @returns Unified tracking information.
 */
export async function fetchGenericTracking(trackingNumber: string, carrier: Carrier): Promise<UnifiedTrackingInfo> {
  console.log(`Simulating generic tracking for ${carrier}: ${trackingNumber}`);
  await new Promise(resolve => setTimeout(resolve, 400));

  if (trackingNumber.includes('ERROR')) {
    return {
      trackingNumber,
      carrier,
      currentStatus: 'Exception',
      trackingEvents: [],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
      error: `Tracking number not found or invalid for ${carrier}.`,
    };
  }

  return {
    trackingNumber,
    carrier,
    currentStatus: 'In Transit',
    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    trackingEvents: [
      { status: 'Processing at Facility', location: 'Major Hub', timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() },
      { status: 'Shipment Information Received', location: 'Origin', timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString() },
    ],
    lastUpdated: new Date().toISOString(),
    isDelivered: false,
  };
}

/**
 * @param trackingNumber The tracking number.
 * @param carrier The detected carrier.
 * @returns Unified tracking information.
 * @throws Error if the carrier is not supported by the mock.
 */
export async function fetchMockTracking(trackingNumber: string, carrier: Carrier): Promise<UnifiedTrackingInfo> {
  switch (carrier) {
    case 'UPS':
      return fetchUpsTracking(trackingNumber);
    case 'USPS':
      return fetchUspsTracking(trackingNumber);
    case 'FedEx':
    case 'DHL':
    case 'Amazon Logistics':
    case 'OnTrac':
      return fetchGenericTracking(trackingNumber, carrier);
    default:
      throw new Error(`Mock tracking not available for carrier: ${carrier}`);
  }
}
