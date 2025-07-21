import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { detectCarrier } from '../utils/carriers';
import { fetchMockTracking } from '../utils/mockCarriers';
import { UnifiedTrackingInfo } from '../utils/types';
import { authenticateToken } from '../utils/auth';

import { z } from 'zod';

const trackSchema = z.object({
  trackingNumber: z.string().min(1, 'Tracking number is required'),
  alias: z.string().optional(), 
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { trackingNumber, alias } = trackSchema.parse(body);

    const authResult = authenticateToken(request); 

    if (authResult instanceof NextResponse) {
        return authResult;
    }
    const userId: string = authResult;
    const isAuthenticated = typeof userId === 'string';

    const carrier = detectCarrier(trackingNumber);

    if (carrier === 'Unknown') {
      return NextResponse.json({ message: 'Unknown carrier for this tracking number format.' }, { status: 400 });
    }

    let trackingInfo: UnifiedTrackingInfo;
    try {

      trackingInfo = await fetchMockTracking(trackingNumber, carrier);
    } catch (apiError: any) {
      console.error(`Error fetching tracking from ${carrier} API:`, apiError);
      return NextResponse.json({ message: `Failed to fetch tracking from ${carrier}. Please try again later.`, carrier, error: apiError.message }, { status: 500 });
    }

    if (trackingInfo.error) {
      return NextResponse.json({ message: trackingInfo.error, carrier, trackingNumber }, { status: 404 });
    }


    await prisma.trackingHistory.create({
      data: {
        trackingNumber: trackingInfo.trackingNumber,
        carrier: trackingInfo.carrier,
        status: trackingInfo.currentStatus,
        location: trackingInfo.trackingEvents.length > 0 ? trackingInfo.trackingEvents[0].location : null,
        description: trackingInfo.trackingEvents.length > 0 ? trackingInfo.trackingEvents[0].description : null,
        timestamp: new Date(trackingInfo.lastUpdated),
        userId: isAuthenticated ? userId : null, 
      },
    });

    if (isAuthenticated) {
      const existingSavedTracking = await prisma.savedTracking.findUnique({
        where: {
          userId_trackingNumber: {
            userId: userId as string,
            trackingNumber: trackingNumber,
          },
        },
      });

      if (!existingSavedTracking) {
        await prisma.savedTracking.create({
          data: {
            userId: userId as string,
            trackingNumber: trackingNumber,
            carrier: trackingInfo.carrier,
            alias: alias || null, 
          },
        });
      } else if (alias && existingSavedTracking.alias !== alias) {
        await prisma.savedTracking.update({
          where: { id: existingSavedTracking.id },
          data: { alias },
        });
      }
    }

    return NextResponse.json({ message: 'Tracking information retrieved successfully', data: trackingInfo }, { status: 200 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation Error', errors: error.issues }, { status: 400 });
    }

    console.error('Universal tracking endpoint error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
