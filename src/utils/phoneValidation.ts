import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validateAndFormatPhone(phone: string): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  try {
    // Parse phone number with Canadian default
    const phoneNumber = parsePhoneNumberFromString(phone, 'CA');
    
    if (!phoneNumber) {
      return { isValid: false, error: 'Invalid phone number format' };
    }

    if (!phoneNumber.isValid()) {
      return { isValid: false, error: 'Invalid phone number' };
    }

    // Return E.164 formatted number
    return {
      isValid: true,
      formatted: phoneNumber.format('E.164')
    };
  } catch (error) {
    return { isValid: false, error: 'Invalid phone number format' };
  }
}

export function formatPhoneDisplay(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, 'CA');
    return phoneNumber ? phoneNumber.formatNational() : phone;
  } catch {
    return phone;
  }
}