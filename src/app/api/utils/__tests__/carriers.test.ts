import { detectCarrier, Carrier } from '../carriers';

describe('Carrier Detection Logic', () => {
  test('should detect UPS for a valid 1Z tracking number', () => {
    expect(detectCarrier('1Z9999999999999999')).toBe('UPS');
    expect(detectCarrier('1ZABCDEF1234567890')).toBe('UPS');
  });

  test('should detect FedEx for 12-digit numbers', () => {
    expect(detectCarrier('123456789012')).toBe('FedEx');
  });
  test('should detect FedEx for 14-digit numbers', () => {
    expect(detectCarrier('12345678901234')).toBe('FedEx');
  });
  test('should detect FedEx for 20-digit numbers', () => {
    expect(detectCarrier('12345678901234567890')).toBe('FedEx');
  });
  test('should detect FedEx for 22-digit numbers', () => {
    expect(detectCarrier('1234567890123456789012')).toBe('FedEx');
  });
  test('should detect FedEx for 34-digit numbers (SmartPost)', () => {
    expect(detectCarrier('1234567890123456789012345678901234')).toBe('FedEx');
  });

  test('should detect USPS for 22-digit numbers starting with 9400, 9205, 9361', () => {
    expect(detectCarrier('9400100000000000000000')).toBe('USPS');
    expect(detectCarrier('9205500000000000000000')).toBe('USPS');
    expect(detectCarrier('9361289690931000488211')).toBe('USPS');
  });
  test('should detect USPS for 13-digit international format (RR123456789US)', () => {
    expect(detectCarrier('RR123456789US')).toBe('USPS');
    expect(detectCarrier('CP987654321CN')).toBe('USPS');
  });
  test('should detect USPS for 30-33 digit numbers starting with 420', () => {
    expect(detectCarrier('420123456789012345678901234567890')).toBe('USPS'); 
    expect(detectCarrier('42012345678901234567890123456789')).toBe('USPS'); 
    expect(detectCarrier('4201234567890123456789012345678')).toBe('USPS'); 
    expect(detectCarrier('420123456789012345678901234567')).toBe('USPS'); 
  });

  test('should detect DHL for 10-11 digit numbers', () => {
    expect(detectCarrier('1234567890')).toBe('DHL');
    expect(detectCarrier('12345678901')).toBe('DHL');
  });
  test('should detect DHL for numbers starting with 3S, JV, JD', () => {
    expect(detectCarrier('3S123456789')).toBe('DHL');
    expect(detectCarrier('JV123456789')).toBe('DHL');
    expect(detectCarrier('JD123456789')).toBe('DHL');
  });

  test('should detect Amazon Logistics for TBA numbers', () => {
    expect(detectCarrier('TBA123456789012')).toBe('Amazon Logistics');
  });

  test('should detect OnTrac for C + 8 digits', () => {
    expect(detectCarrier('C12345678')).toBe('OnTrac');
  });

  test('should return Unknown for unrecognized formats', () => {
    expect(detectCarrier('INVALIDTRACKING')).toBe('Unknown');
    expect(detectCarrier('123')).toBe('Unknown');
    expect(detectCarrier('ABC123XYZ')).toBe('Unknown');
  });

  test('should handle numbers with spaces', () => {
    expect(detectCarrier('1Z 999 999 9999999999')).toBe('UPS');
    expect(detectCarrier('9400 1000 0000 0000 0000 00')).toBe('USPS');
  });
});
