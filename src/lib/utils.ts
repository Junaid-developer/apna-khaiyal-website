import { CompanyInformation } from '../types';

/**
 * Default fallback CEO WhatsApp number.
 */
export const DEFAULT_CEO_WHATSAPP = '+923090111330';

/**
 * Formats a raw phone string into standard international format (+countrycode...).
 */
export const formatWhatsAppNumber = (raw: string): string => {
  if (!raw) return '';
  const trimmed = raw.trim();
  const cleanDigits = trimmed.replace(/[\s\-\(\)]/g, '').replace(/^\+/, '');
  if (!cleanDigits) return '';
  return `+${cleanDigits}`;
};

/**
 * Extracts and cleans the CEO WhatsApp number from company information or raw string.
 * Read ceo_whatsapp ONLY from company_information table.
 */
export const getCEOWhatsAppNumber = (input?: Partial<CompanyInformation> | string | null): string => {
  let rawNumber = '';
  if (typeof input === 'string') {
    rawNumber = input;
  } else if (input && typeof input === 'object') {
    rawNumber = (input as any).ceoWhatsApp || (input as any).ceo_whatsapp || (input as any).ceoWhatsAppNumber || (input as any).whatsappNumber || '';
  }
  if (!rawNumber || rawNumber.includes('30591101291') || rawNumber.includes('3001234567')) {
    rawNumber = DEFAULT_CEO_WHATSAPP;
  }
  const cleanDigits = rawNumber.replace(/\D/g, '');
  const fallbackDigits = DEFAULT_CEO_WHATSAPP.replace(/\D/g, '');
  if (cleanDigits.includes('30591101291') || cleanDigits.includes('3001234567')) {
    return fallbackDigits;
  }
  return cleanDigits || fallbackDigits;
};

/**
 * Generates the direct WhatsApp chat link for the CEO: https://wa.me/<CEO_NUMBER>
 * Reads ceo_whatsapp ONLY from company_information table.
 */
export const getWhatsAppLink = (input?: Partial<CompanyInformation> | string | null): string => {
  const digits = getCEOWhatsAppNumber(input);
  return `https://wa.me/${digits}`;
};

/**
 * Generates the direct WhatsApp chat link for the CEO (alias for getWhatsAppLink).
 */
export const getCEOWhatsAppUrl = (input?: Partial<CompanyInformation> | string | null): string => {
  return getWhatsAppLink(input);
};
