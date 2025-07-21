export interface PostalCodePrefix {
  prefix: string;
  type: 'broad' | 'medium' | 'specific';
  coverageDescription: string;
  estimatedAreas: number;
}

export const POSTAL_CODE_TYPES = {
  BROAD: 'broad',      // 1 character: L, M, K
  MEDIUM: 'medium',    // 2 characters: L5, M1, K1
  SPECIFIC: 'specific' // 3 characters: L5J, M1C, K1A
} as const;

// Major Canadian city/region presets
export const POSTAL_CODE_PRESETS = {
  'Greater Toronto Area': ['L', 'M'],
  'Toronto Core': ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'],
  'Mississauga': ['L4T', 'L4V', 'L4W', 'L4X', 'L4Y', 'L4Z', 'L5A', 'L5B', 'L5C'],
  'Brampton': ['L6P', 'L6R', 'L6S', 'L6T', 'L6V', 'L6W', 'L6X', 'L6Y', 'L6Z', 'L7A'],
  'Ottawa': ['K1', 'K2', 'K4'],
  'Montreal': ['H'],
  'Vancouver': ['V'],
  'Calgary': ['T2', 'T3'],
  'Edmonton': ['T5', 'T6'],
  'Winnipeg': ['R'],
  'Halifax': ['B']
};

export const validatePostalPrefix = (prefix: string): { isValid: boolean; type?: string; error?: string } => {
  const cleaned = prefix.trim().toUpperCase();
  
  if (!cleaned) {
    return { isValid: false, error: 'Prefix cannot be empty' };
  }

  // Valid Canadian postal letters (excluding D, F, I, O, Q, U, W)
  const validFirstLetters = /^[ABCEGHJ-NPRSTVXY]$/;
  const validThirdLetters = /^[ABCEGHJ-NPRSTV-Z]$/;

  if (cleaned.length === 1) {
    // Broad coverage: single letter
    if (validFirstLetters.test(cleaned)) {
      return { isValid: true, type: POSTAL_CODE_TYPES.BROAD };
    }
    return { isValid: false, error: 'Invalid postal code letter' };
  }

  if (cleaned.length === 2) {
    // Medium coverage: letter + digit
    if (validFirstLetters.test(cleaned[0]) && /\d/.test(cleaned[1])) {
      return { isValid: true, type: POSTAL_CODE_TYPES.MEDIUM };
    }
    return { isValid: false, error: 'Format must be: Letter + Digit (e.g., L5, M1)' };
  }

  if (cleaned.length === 3) {
    // Specific coverage: letter + digit + letter
    if (validFirstLetters.test(cleaned[0]) && 
        /\d/.test(cleaned[1]) && 
        validThirdLetters.test(cleaned[2])) {
      return { isValid: true, type: POSTAL_CODE_TYPES.SPECIFIC };
    }
    return { isValid: false, error: 'Format must be: Letter + Digit + Letter (e.g., L5J, M1C)' };
  }

  return { isValid: false, error: 'Prefix must be 1-3 characters long' };
};

export const getPostalPrefixInfo = (prefix: string): PostalCodePrefix => {
  const validation = validatePostalPrefix(prefix);
  const type = validation.type as 'broad' | 'medium' | 'specific';
  
  let coverageDescription = '';
  let estimatedAreas = 0;

  switch (type) {
    case 'broad':
      coverageDescription = `Entire ${prefix} region (province/major area)`;
      estimatedAreas = 100;
      break;
    case 'medium':
      coverageDescription = `${prefix}* areas (city/district level)`;
      estimatedAreas = 20;
      break;
    case 'specific':
      coverageDescription = `${prefix}* neighborhood areas`;
      estimatedAreas = 5;
      break;
    default:
      coverageDescription = 'Unknown coverage';
      estimatedAreas = 0;
  }

  return {
    prefix,
    type,
    coverageDescription,
    estimatedAreas
  };
};

export const checkForOverlappingPrefixes = (prefixes: string[]): { hasOverlap: boolean; conflicts: string[] } => {
  const conflicts: string[] = [];
  
  for (let i = 0; i < prefixes.length; i++) {
    for (let j = i + 1; j < prefixes.length; j++) {
      const prefix1 = prefixes[i];
      const prefix2 = prefixes[j];
      
      // Check if one prefix is contained within another
      if (prefix1.startsWith(prefix2) || prefix2.startsWith(prefix1)) {
        const conflict = `${prefix1} overlaps with ${prefix2}`;
        if (!conflicts.includes(conflict)) {
          conflicts.push(conflict);
        }
      }
    }
  }
  
  return {
    hasOverlap: conflicts.length > 0,
    conflicts
  };
};

export const formatPostalPrefix = (prefix: string): string => {
  return prefix.trim().toUpperCase();
};

export const getPostalPrefixDisplay = (prefix: string): string => {
  const info = getPostalPrefixInfo(prefix);
  switch (info.type) {
    case 'broad':
      return `${prefix}*`;
    case 'medium':
      return `${prefix}*`;
    case 'specific':
      return `${prefix}*`;
    default:
      return prefix;
  }
};

export const calculateTotalCoverage = (prefixes: string[]): { totalAreas: number; coverageLevel: string } => {
  const totalAreas = prefixes.reduce((sum, prefix) => {
    const info = getPostalPrefixInfo(prefix);
    return sum + info.estimatedAreas;
  }, 0);

  let coverageLevel = 'Limited';
  if (totalAreas > 50) coverageLevel = 'Good';
  if (totalAreas > 100) coverageLevel = 'Excellent';
  if (totalAreas > 200) coverageLevel = 'Maximum';

  return { totalAreas, coverageLevel };
};