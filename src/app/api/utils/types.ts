
export interface TrackingEvent {
  status: string;
  location?: string;
  timestamp: string; 
  description?: string;
}


export interface UnifiedTrackingInfo {
  trackingNumber: string;
  carrier: string;
  currentStatus: string;
  estimatedDelivery?: string;
  trackingEvents: TrackingEvent[];
  lastUpdated: string;
  isDelivered: boolean;
  error?: string; 
}
