export type Carrier = 'UPS' | 'FedEx' | 'USPS' | 'DHL' | 'Amazon Logistics' | 'OnTrac' | 'Unknown';

/**
 * Detects the carrier based on the tracking number format.
 * @param trackingNumber The tracking number.
 * @returns The detected carrier name or 'Unknown'.
 */
export function detectCarrier(trackingNumber: string): Carrier {
  const cleanedNumber = trackingNumber.replace(/\s/g, '');

  if (/^1Z[0-9A-Z]{16}$/.test(cleanedNumber)) {
    return 'UPS';
  }

  if (/^TBA\d{12}$/.test(cleanedNumber)) {
    return 'Amazon Logistics';
  }

  if (/^C\d{8}$/.test(cleanedNumber)) {
    return 'OnTrac';
  }

  if (
    /^(9400|9205|9361)\d{18}$/.test(cleanedNumber) || 
    /^[A-Z]{2}\d{9}[A-Z]{2}$/.test(cleanedNumber) ||
    /^420\d{27,30}$/.test(cleanedNumber) 
  ) {
    return 'USPS';
  }

  if (/^(3S|JV|JD)?\d{8,9}$/.test(cleanedNumber) || /^\d{10,11}$/.test(cleanedNumber)) {
    return 'DHL';
  }

  if (
    /^\d{12}$/.test(cleanedNumber) || 
    /^\d{14}$/.test(cleanedNumber) || 
    /^\d{20}$/.test(cleanedNumber) || 
    /^\d{22}$/.test(cleanedNumber) || 
    /^\d{34}$/.test(cleanedNumber)
  ) {
    return 'FedEx';
  }

  return 'Unknown';
}
