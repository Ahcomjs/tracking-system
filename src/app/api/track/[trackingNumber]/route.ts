import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { UnifiedTrackingInfo, TrackingEvent } from '../../utils/types';
import { Carrier, detectCarrier } from '../../utils/carriers';

export async function GET(request: NextRequest, { params }: { params: { trackingNumber: string } }) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json({ message: 'Tracking number is required' }, { status: 400 });
    }

    const latestTracking = await prisma.trackingHistory.findFirst({
      where: { trackingNumber },
      orderBy: { timestamp: 'desc' }, 
    });

    if (!latestTracking) {
      return NextResponse.json({ message: 'No cached tracking information found for this number.' }, { status: 404 });
    }

    const allEvents = await prisma.trackingHistory.findMany({
      where: { trackingNumber },
      orderBy: { timestamp: 'asc' }, 
    });

    const trackingEvents: TrackingEvent[] = allEvents.map(event => ({
      status: event.status,
      location: event.location || undefined,
      timestamp: event.timestamp.toISOString(),
      description: event.description || undefined,
    }));

    const carrier = latestTracking.carrier as Carrier || detectCarrier(trackingNumber);


    const unifiedInfo: UnifiedTrackingInfo = {
      trackingNumber: latestTracking.trackingNumber,
      carrier: carrier,
      currentStatus: latestTracking.status,
      estimatedDelivery: undefined, 
      trackingEvents: trackingEvents,
      lastUpdated: latestTracking.updatedAt.toISOString(),
      isDelivered: latestTracking.status.toLowerCase().includes('delivered'),
    };

    return NextResponse.json({ message: 'Cached tracking information retrieved successfully', data: unifiedInfo }, { status: 200 });

  } catch (error) {
    console.error('Get cached tracking error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
