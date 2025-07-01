
export const formatAndValidatePostalCode = (value: string, currentValue: string): string => {
  // Remove all spaces and convert to uppercase
  const cleaned = value.replace(/\s/g, '').toUpperCase();
  
  // Valid Canadian postal letters (excluding D, F, I, O, Q, U, W)
  const validFirstPositionLetters = /^[ABCEGHJ-NPRSTVXY]$/;
  const validThirdPositionLetters = /^[ABCEGHJ-NPRSTV-Z]$/;
  
  let formatted = '';
  
  for (let i = 0; i < cleaned.length && i < 6; i++) {
    const char = cleaned[i];
    
    if (i === 0) {
      // First position: only valid Canadian postal letters
      if (validFirstPositionLetters.test(char)) {
        formatted += char;
      } else {
        return currentValue;
      }
    } else if (i === 1) {
      // Second position: digits only
      if (/[0-9]/.test(char)) {
        formatted += char;
      } else {
        return currentValue;
      }
    } else if (i === 2) {
      // Third position: valid postal letters
      if (validThirdPositionLetters.test(char)) {
        formatted += char;
        // Add space after the third character to create A1A 1A1 format
        formatted += ' ';
      } else {
        return currentValue;
      }
    } else if (i === 3) {
      // Fourth position: digit only
      if (/[0-9]/.test(char)) {
        formatted += char;
      } else {
        return currentValue;
      }
    } else if (i === 4) {
      // Fifth position: valid postal letters
      if (validThirdPositionLetters.test(char)) {
        formatted += char;
      } else {
        return currentValue;
      }
    } else if (i === 5) {
      // Sixth position: digit only
      if (/[0-9]/.test(char)) {
        formatted += char;
      } else {
        return currentValue;
      }
    }
  }
  
  return formatted;
};

export const validatePostalCode = (code: string): boolean => {
  // Strict Canadian postal code regex
  const postalCodeRegex = /^[ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z] \d[ABCEGHJ-NPRSTV-Z]\d$/;
  return postalCodeRegex.test(code);
};
