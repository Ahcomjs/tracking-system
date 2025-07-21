import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TrackingEvent } from '../../../utils/types';

export async function GET(request: NextRequest, { params }: { params: { trackingNumber: string } }) {
  try {
    const { trackingNumber } = await params;

    if (!trackingNumber) {
      return NextResponse.json({ message: 'Tracking number is required' }, { status: 400 });
    }

    const history = await prisma.trackingHistory.findMany({
      where: { trackingNumber },
      orderBy: { timestamp: 'asc' }, 
    });

    if (history.length === 0) {
      return NextResponse.json({ message: 'No tracking history found for this number.' }, { status: 404 });
    }

    const trackingEvents: TrackingEvent[] = history.map(event => ({
      status: event.status,
      location: event.location || undefined,
      timestamp: event.timestamp.toISOString(),
      description: event.description || undefined,
    }));

    return NextResponse.json({ message: 'Tracking history retrieved successfully', data: trackingEvents }, { status: 200 });

  } catch (error) {
    console.error('Get full tracking history error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
