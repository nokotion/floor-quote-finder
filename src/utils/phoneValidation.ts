
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

  console.log(`Validating phone: "${phone}", strict: ${strict}`);

  // Remove any formatting to get just digits
  const cleanPhone = phone.replace(/\D/g, '');
  console.log(`Clean digits: "${cleanPhone}"`);
  
  // For non-strict validation (during typing), be more lenient
  if (!strict && cleanPhone.length >= 7 && cleanPhone.length <= 12) {
    // Basic length validation for partial input
    if (cleanPhone.length === 10) {
      // Canadian 10-digit number
      const areaCode = cleanPhone.substring(0, 3);
      const validAreaCodes = ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '672', '705', '709', '742', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'];
      
      if (validAreaCodes.includes(areaCode)) {
        return {
          isValid: true,
          formatted: `+1${cleanPhone}`
        };
      }
    }
    
    // Allow partial input during typing
    return { isValid: true };
  }

  try {
    // Use libphonenumber for strict validation
    const phoneNumber = parsePhoneNumberFromString(phone, 'CA');
    
    if (!phoneNumber) {
      console.log('libphonenumber could not parse, trying fallback');
      return fallbackValidation(phone);
    }

    if (!phoneNumber.isValid()) {
      console.log('Phone number is invalid according to libphonenumber');
      return { isValid: false, error: 'Invalid phone number format' };
    }

    // Return E.164 formatted number
    const formatted = phoneNumber.format('E.164');
    console.log(`Phone validated and formatted: ${phone} -> ${formatted}`);
    
    return {
      isValid: true,
      formatted: formatted
    };
  } catch (error) {
    console.error('Error in phone validation:', error);
    return fallbackValidation(phone);
  }
}

function fallbackValidation(phone: string): PhoneValidationResult {
  console.log(`Using fallback validation for: "${phone}"`);
  
  const digits = phone.replace(/\D/g, '');
  
  // Canadian phone number validation
  if (digits.length === 10) {
    // 10-digit Canadian number
    const areaCode = digits.substring(0, 3);
    const validAreaCodes = ['204', '226', '236', '249', '250', '289', '306', '343', '365', '403', '416', '418', '431', '437', '438', '450', '506', '514', '519', '548', '579', '581', '587', '604', '613', '639', '647', '672', '705', '709', '742', '778', '780', '782', '807', '819', '825', '867', '873', '902', '905'];
    
    if (validAreaCodes.includes(areaCode)) {
      return {
        isValid: true,
        formatted: `+1${digits}`
      };
    } else {
      return { isValid: false, error: 'Invalid Canadian area code' };
    }
  }
  
  if (digits.length === 11 && digits.startsWith('1')) {
    // 11-digit number starting with 1 (North American format)
    return {
      isValid: true,
      formatted: `+${digits}`
    };
  }
  
  return { isValid: false, error: 'Please enter a valid Canadian phone number (10 digits)' };
}

export function formatPhoneDisplay(phone: string): string {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, 'CA');
    return phoneNumber ? phoneNumber.formatNational() : phone;
  } catch {
    // Fallback formatting for display
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.substring(0, 3)}) ${digits.substring(3, 6)}-${digits.substring(6)}`;
    }
    return phone;
  }
}
