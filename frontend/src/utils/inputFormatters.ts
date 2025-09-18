/**
 * Input masking utilities for forms
 */

/**
 * Creates a card number input mask that formats as user types
 * @param value - The current input value
 * @returns Formatted card number string
 */
export const maskCardNumber = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 16 digits
  const limitedDigits = digits.substring(0, 16);
  
  // Add spaces every 4 digits
  let formatted = '';
  for (let i = 0; i < limitedDigits.length; i += 4) {
    if (i > 0) formatted += ' ';
    formatted += limitedDigits.substring(i, i + 4);
  }
  
  return formatted;
};

/**
 * Creates an expiry date input mask (MM/YY) that handles backspace properly
 * @param value - The current input value
 * @param previousValue - The previous input value (to detect backspace)
 * @returns Formatted expiry string
 */
export const maskExpiry = (value: string, previousValue: string = '') => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  const prevDigits = previousValue.replace(/\D/g, '');
  
  // Detect if user is backspacing
  const isBackspacing = digits.length < prevDigits.length;
  
  // Limit to 4 digits
  const limitedDigits = digits.substring(0, 4);
  
  // If backspacing and we have exactly 2 digits, don't add the slash yet
  // This allows users to backspace through the slash
  if (isBackspacing && limitedDigits.length === 2) {
    return limitedDigits;
  }
  
  // Add slash after 2 digits (but not when backspacing from 2 digits)
  if (limitedDigits.length >= 2) {
    return limitedDigits.substring(0, 2) + '/' + limitedDigits.substring(2);
  }
  
  return limitedDigits;
};

/**
 * Creates a CVV input mask (digits only)
 * @param value - The current input value
 * @returns Formatted CVV string
 */
export const maskCVV = (value: string) => {
  // Only allow digits, max 4 characters
  return value.replace(/\D/g, '').substring(0, 3);
};

/**
 * Creates a CEP input mask (XXXXX-XXX)
 * @param value - The current input value
 * @returns Formatted CEP string
 */
export const maskCEP = (value: string) => {
  // Remove all non-digits
  const digits = value.replace(/\D/g, '');
  
  // Limit to 8 digits
  const limitedDigits = digits.substring(0, 8);
  
  // Add hyphen after 5 digits
  if (limitedDigits.length > 5) {
    return limitedDigits.substring(0, 5) + '-' + limitedDigits.substring(5);
  }
  
  return limitedDigits;
};
