import dayjs from 'dayjs';

/**
 * Formats a CPF string (e.g., 12345678901 to 123.456.789-01).
 * @param cpf The CPF string to format.
 * @returns The formatted CPF or 'N/A'.
 */
export const formatCPF = (cpf?: string | null): string => {
  if (!cpf) return 'N/A';
  const cleaned = cpf.replace(/\D/g, '');
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formats an RG string (e.g., 123456789 to 12.345.678-9).
 * @param rg The RG string to format.
 * @returns The formatted RG or 'N/A'.
 */
export const formatRG = (rg?: string | null): string => {
  if (!rg) return 'N/A';
  const cleaned = rg.replace(/\D/g, '');
  // Basic mask, can be adjusted for different state formats
  if (cleaned.length > 7) {
    return cleaned.replace(/(\d{2})(\d{3})(\d{3})(\w{1})/, '$1.$2.$3-$4');
  }
  return rg;
};

/**
 * Formats a phone number string.
 * @param phone The phone number to format.
 * @returns The formatted phone number or 'N/A'.
 */
export const formatPhone = (phone?: string | null): string => {
  if (!phone) return 'N/A';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  }
  return phone;
};

/**
 * Formats a CEP string (e.g., 12345678 to 12345-678).
 * @param cep The CEP string to format.
 * @returns The formatted CEP or 'N/A'.
 */
export const formatCEP = (cep?: string | null): string => {
  if (!cep) return 'N/A';
  const cleaned = cep.replace(/\D/g, '');
  if (cleaned.length !== 8) return cep;
  return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2');
};

/**
 * Formats a date string to DD/MM/YYYY.
 * @param date The date string to format.
 * @returns The formatted date or 'N/A'.
 */
export const formatDate = (date?: string | null): string => {
  if (!date) return 'N/A';
  return dayjs(date).format('DD/MM/YYYY');
};
