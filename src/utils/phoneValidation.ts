import { parsePhoneNumberFromString } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string;
  error?: string;
}

export function validateAndFormatPhone(phone: string, strict: boolean = false): PhoneValidationResult {
  if (!phone || phone.trim() === '') {
    return { isValid: false, error: 'Phone number is required' };
  }

  const cleanPhone = phone.replace(/\D/g, '');
  
  // For non-strict validation (during typing), accept 10-digit Canadian numbers
  if (!strict && cleanPhone.length === 10) {
    // Check if it's a valid Canadian area code (rough check)
    const areaCode = cleanPhone.substring(0, 3);
    const validAreaCodes = ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '672', '705', '709', '742', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'];
    
    if (validAreaCodes.includes(areaCode)) {
      return {
        isValid: true,
        formatted: `+1${cleanPhone}`
      };
    }
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