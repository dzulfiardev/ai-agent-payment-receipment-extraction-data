/**
 * Currency formatting utilities for receipt data
 */

// Currency to locale mapping for proper formatting
const CURRENCY_LOCALE_MAP: { [key: string]: string } = {
  USD: 'en-US',
  EUR: 'de-DE',
  GBP: 'en-GB',
  JPY: 'ja-JP',
  CAD: 'en-CA',
  AUD: 'en-AU',
  CHF: 'de-CH',
  CNY: 'zh-CN',
  INR: 'en-IN',
  KRW: 'ko-KR',
  SGD: 'en-SG',
  HKD: 'en-HK',
  MXN: 'es-MX',
  BRL: 'pt-BR',
  RUB: 'ru-RU',
  SEK: 'sv-SE',
  NOK: 'nb-NO',
  DKK: 'da-DK',
  PLN: 'pl-PL',
  CZK: 'cs-CZ',
  HUF: 'hu-HU',
  RON: 'ro-RO',
  BGN: 'bg-BG',
  HRK: 'hr-HR',
  TRY: 'tr-TR',
  ILS: 'he-IL',
  AED: 'ar-AE',
  SAR: 'ar-SA',
  THB: 'th-TH',
  VND: 'vi-VN',
  IDR: 'id-ID',
  MYR: 'ms-MY',
  PHP: 'en-PH',
  TWD: 'zh-TW',
  NZD: 'en-NZ',
  ZAR: 'en-ZA',
  EGP: 'ar-EG',
  NGN: 'en-NG',
  KES: 'sw-KE',
  GHS: 'en-GH',
  MAD: 'ar-MA',
  TND: 'ar-TN',
  JOD: 'ar-JO',
  LBP: 'ar-LB',
  QAR: 'ar-QA',
  KWD: 'ar-KW',
  BHD: 'ar-BH',
  OMR: 'ar-OM'
};

/**
 * Format currency amount based on currency code
 * @param amount - The amount to format (number or string)
 * @param currencyCode - ISO 4217 currency code (e.g., USD, EUR, GBP)
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number | string, currencyCode: string = 'USD'): string => {
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return 'N/A';
  }

  // Get the appropriate locale for the currency
  const locale = CURRENCY_LOCALE_MAP[currencyCode.toUpperCase()] || 'en-US';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  } catch (error) {
    // Fallback to USD formatting if currency is not supported
    console.warn(`Currency ${currencyCode} not supported, falling back to USD`);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount);
  }
};

/**
 * Get currency symbol from currency code
 * @param currencyCode - ISO 4217 currency code
 * @returns Currency symbol (e.g., $, €, £)
 */
export const getCurrencySymbol = (currencyCode: string = 'USD'): string => {
  const locale = CURRENCY_LOCALE_MAP[currencyCode.toUpperCase()] || 'en-US';

  try {
    const formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    });

    // Extract symbol by formatting 0 and removing the number
    const formatted = formatter.format(0);
    return formatted.replace(/[0-9.,\s]/g, '');
  } catch (error) {
    return '$'; // Fallback to dollar sign
  }
};

/**
 * Validate currency code
 * @param currencyCode - Currency code to validate
 * @returns true if valid, false otherwise
 */
export const isValidCurrencyCode = (currencyCode: string): boolean => {
  try {
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
    });
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Detect currency from country/region
 * @param address - Store address string
 * @param language - Receipt language (optional)
 * @returns Most likely currency code
 */
export const detectCurrencyFromLocation = (address?: string, language?: string): string => {
  if (!address && !language) return 'USD';

  const addressLower = address?.toLowerCase() || '';
  const langLower = language?.toLowerCase() || '';

  // Country/region patterns
  const patterns = [
    // North America
    { pattern: /(usa|united states|america|us\s|u\.s\.|canada|ca\s)/i, currency: 'USD' },
    { pattern: /(canada|canadian|ca\s)/i, currency: 'CAD' },

    // Europe
    { pattern: /(germany|deutschland|de\s|berlin|munich|hamburg)/i, currency: 'EUR' },
    { pattern: /(france|french|fr\s|paris|lyon|marseille)/i, currency: 'EUR' },
    { pattern: /(italy|italian|it\s|rome|milan|napoli)/i, currency: 'EUR' },
    { pattern: /(spain|spanish|es\s|madrid|barcelona|valencia)/i, currency: 'EUR' },
    { pattern: /(netherlands|holland|nl\s|amsterdam)/i, currency: 'EUR' },
    { pattern: /(uk|united kingdom|britain|gb\s|london|manchester)/i, currency: 'GBP' },
    { pattern: /(switzerland|swiss|ch\s|zurich|geneva)/i, currency: 'CHF' },

    // Asia
    { pattern: /(japan|japanese|jp\s|tokyo|osaka|kyoto)/i, currency: 'JPY' },
    { pattern: /(china|chinese|cn\s|beijing|shanghai|guangzhou)/i, currency: 'CNY' },
    { pattern: /(india|indian|in\s|mumbai|delhi|bangalore)/i, currency: 'INR' },
    { pattern: /(korea|korean|kr\s|seoul|busan)/i, currency: 'KRW' },
    { pattern: /(singapore|sg\s)/i, currency: 'SGD' },
    { pattern: /(hong kong|hk\s)/i, currency: 'HKD' },
    { pattern: /(thailand|thai|th\s|bangkok)/i, currency: 'THB' },
    { pattern: /(vietnam|vietnamese|vn\s|hanoi|ho chi minh)/i, currency: 'VND' },
    { pattern: /(indonesia|indonesian|id\s|jakarta)/i, currency: 'IDR' },
    { pattern: /(malaysia|malaysian|my\s|kuala lumpur)/i, currency: 'MYR' },
    { pattern: /(philippines|filipino|ph\s|manila)/i, currency: 'PHP' },

    // Oceania
    { pattern: /(australia|australian|au\s|sydney|melbourne)/i, currency: 'AUD' },
    { pattern: /(new zealand|nz\s|auckland)/i, currency: 'NZD' },

    // Middle East & Africa
    { pattern: /(uae|emirates|dubai|abu dhabi)/i, currency: 'AED' },
    { pattern: /(saudi|arabia|riyadh|jeddah)/i, currency: 'SAR' },
    { pattern: /(israel|israeli|il\s|tel aviv|jerusalem)/i, currency: 'ILS' },
    { pattern: /(south africa|za\s|johannesburg|cape town)/i, currency: 'ZAR' },
    { pattern: /(egypt|egyptian|eg\s|cairo)/i, currency: 'EGP' },

    // Americas
    { pattern: /(mexico|mexican|mx\s|mexico city)/i, currency: 'MXN' },
    { pattern: /(brazil|brazilian|br\s|sao paulo|rio)/i, currency: 'BRL' },
  ];

  const searchText = `${addressLower} ${langLower}`;

  for (const { pattern, currency } of patterns) {
    if (pattern.test(searchText)) {
      return currency;
    }
  }

  // Default fallback
  return 'USD';
};