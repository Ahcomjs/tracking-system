jest.mock('next/server', () => {

  const MockNextRequest = jest.fn((url, options) => ({
    url,
    method: options?.method || 'GET',

    headers: {
      get: (name: string) => {
        const headers = options?.headers || {};
        if (typeof headers.get === 'function') { 
          return headers.get(name);
        }

        const lowerName = name.toLowerCase();
        for (const key in headers) {
          if (key.toLowerCase() === lowerName) {
            return (headers as any)[key];
          }
        }
        return undefined;
      },

    },
    json: async () => JSON.parse(options?.body as string || '{}'),
    text: async () => options?.body as string || '',
  }));

  class MockNextResponse {

    public body: any;
    public status: number;
    public headers: Headers;

    constructor(body: any, init?: { status?: number; headers?: HeadersInit }) {
      this.body = body;
      this.status = init?.status || 200;
      this.headers = new Headers(init?.headers);
    }

    static json = jest.fn((body, init) => {
      return new MockNextResponse(body, init);
    });

    json = async () => this.body;
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: MockNextResponse, 
  };
});

import { POST } from '../route';
import prisma from '@/lib/prisma';
import { detectCarrier } from '../../utils/carriers';
import { fetchMockTracking } from '../../utils/mockCarriers';
import { generateToken, verifyToken, authenticateToken } from '../../utils/auth';

jest.mock('@/lib/prisma', () => ({
  __esModule: true,
  default: {
    user: {
      findUnique: jest.fn(),
    },
    trackingHistory: {
      create: jest.fn(),
    },
    savedTracking: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  },
}));

jest.mock('../../utils/carriers', () => ({
  detectCarrier: jest.fn(),
}));
jest.mock('../../utils/mockCarriers', () => ({
  fetchMockTracking: jest.fn(),
}));
jest.mock('../../utils/auth', () => ({
  generateToken: jest.fn(),
  verifyToken: jest.fn(),
  authenticateToken: jest.fn(), 
}));

describe('POST /api/track', () => {
  const mockUserId = 'test-user-id';
  const mockToken = 'mock-jwt-token';


  const { NextRequest: MockedNextRequest, NextResponse: MockedNextResponse } = require('next/server');

  beforeEach(() => {
    jest.clearAllMocks();


    MockedNextRequest.mockClear();
    MockedNextResponse.json.mockClear(); 


    (authenticateToken as jest.Mock).mockImplementation((request: any) => {
      const authHeader = request.headers.get('authorization');
      if (authHeader) {
        const token = authHeader.split(' ')[1];
        if (token === mockToken) {
          return mockUserId; 
        } else {
          return MockedNextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
        }
      }
      return null;
    });


    (verifyToken as jest.Mock).mockReturnValue({ userId: mockUserId });
    (generateToken as jest.Mock).mockReturnValue(mockToken);
    (prisma.user.findUnique as jest.Mock).mockResolvedValue({ id: mockUserId, email: 'test@example.com', name: 'Test User' });
    (prisma.trackingHistory.create as jest.Mock).mockResolvedValue({});
    (prisma.savedTracking.findUnique as jest.Mock).mockResolvedValue(null);
    (prisma.savedTracking.create as jest.Mock).mockResolvedValue({});
  });

  test('should return 400 if trackingNumber is missing', async () => {
    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ alias: 'My Package' }),
    });

    const response = await POST(request as any); 
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Validation Error' }), expect.objectContaining({ status: 400 }));
    expect(response.status).toBe(400); 
  });

  test('should return 400 if carrier is unknown', async () => {
    (detectCarrier as jest.Mock).mockReturnValue('Unknown');

    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ trackingNumber: 'UNKNOWN123' }),
    });

    const response = await POST(request as any);
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Unknown carrier for this tracking number format.' }), expect.objectContaining({ status: 400 }));
    expect(response.status).toBe(400);
  });

  test('should successfully track a valid number and return unified info (authenticated)', async () => {
    (detectCarrier as jest.Mock).mockReturnValue('UPS');
    (fetchMockTracking as jest.Mock).mockResolvedValue({
      trackingNumber: '1Z1234567890123456',
      carrier: 'UPS',
      currentStatus: 'In Transit',
      trackingEvents: [{ status: 'Origin Scan', timestamp: new Date().toISOString() }],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    });

    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({ trackingNumber: '1Z1234567890123456', alias: 'My UPS Package' }),
    });

    const response = await POST(request as any);
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Tracking information retrieved successfully' }), expect.objectContaining({ status: 200 }));
    expect(response.status).toBe(200);
    const json = await response.json(); 
    expect(json.data.trackingNumber).toBe('1Z1234567890123456');
    expect(json.data.carrier).toBe('UPS');
    expect(prisma.trackingHistory.create).toHaveBeenCalledTimes(1);
    expect(prisma.savedTracking.create).toHaveBeenCalledWith(expect.objectContaining({
      data: {
        userId: mockUserId,
        trackingNumber: '1Z1234567890123456',
        carrier: 'UPS',
        alias: 'My UPS Package',
      },
    }));
  });

  test('should successfully track a valid number without authentication', async () => {
    (detectCarrier as jest.Mock).mockReturnValue('USPS');
    (fetchMockTracking as jest.Mock).mockResolvedValue({
      trackingNumber: '9400100000000000000000',
      carrier: 'USPS',
      currentStatus: 'Delivered',
      trackingEvents: [{ status: 'Delivered', timestamp: new Date().toISOString() }],
      lastUpdated: new Date().toISOString(),
      isDelivered: true,
    });


    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, 
      body: JSON.stringify({ trackingNumber: '9400100000000000000000' }),
    });

    const response = await POST(request as any);
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Tracking information retrieved successfully' }), expect.objectContaining({ status: 200 }));
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json.data.trackingNumber).toBe('9400100000000000000000');
    expect(json.data.carrier).toBe('USPS');
    expect(prisma.trackingHistory.create).toHaveBeenCalledTimes(1); 
    expect(prisma.savedTracking.create).not.toHaveBeenCalled();
  });


  test('should handle carrier API errors gracefully', async () => {
    (detectCarrier as jest.Mock).mockReturnValue('FedEx');
    (fetchMockTracking as jest.Mock).mockResolvedValue({
      trackingNumber: '123456789012',
      carrier: 'FedEx',
      currentStatus: 'Exception',
      trackingEvents: [],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
      error: 'Tracking number not found for FedEx.',
    });

    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({ trackingNumber: '123456789012' }),
    });

    const response = await POST(request as any);
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Tracking number not found for FedEx.' }), expect.objectContaining({ status: 404 }));
    expect(response.status).toBe(404); 
    const json = await response.json();
    expect(json.message).toBe('Tracking number not found for FedEx.');
    expect(json.carrier).toBe('FedEx');
  });

  test('should update alias if saved tracking exists and alias is different', async () => {
    (detectCarrier as jest.Mock).mockReturnValue('UPS');
    (fetchMockTracking as jest.Mock).mockResolvedValue({
      trackingNumber: '1Z1234567890123456',
      carrier: 'UPS',
      currentStatus: 'In Transit',
      trackingEvents: [{ status: 'Origin Scan', timestamp: new Date().toISOString() }],
      lastUpdated: new Date().toISOString(),
      isDelivered: false,
    });

    (prisma.savedTracking.findUnique as jest.Mock).mockResolvedValue({
      id: 'existing-saved-id',
      userId: mockUserId,
      trackingNumber: '1Z1234567890123456',
      carrier: 'UPS',
      alias: 'Old Alias',
    });

    const request = new MockedNextRequest('http://localhost/api/track', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${mockToken}`
      },
      body: JSON.stringify({ trackingNumber: '1Z1234567890123456', alias: 'New Alias' }),
    });

    const response = await POST(request as any);
    expect(MockedNextResponse.json).toHaveBeenCalledWith(expect.objectContaining({ message: 'Tracking information retrieved successfully' }), expect.objectContaining({ status: 200 }));
    expect(response.status).toBe(200);
    expect(prisma.savedTracking.update).toHaveBeenCalledWith(expect.objectContaining({
      where: { id: 'existing-saved-id' },
      data: { alias: 'New Alias' },
    }));
    expect(prisma.savedTracking.create).not.toHaveBeenCalled(); 
  });
});
