import { useEffect } from 'react';
import { FormApi } from 'final-form';

/**
 * Custom hook to handle masked input fields with react-final-form
 * Ensures proper initialization and synchronization of masked field values
 */
export const useMaskedField = (
  form: FormApi<any>, 
  fieldName: string, 
  value: string | undefined | null
) => {
  useEffect(() => {
    // Only update if the form field is different from the provided value
    const currentValue = form.getFieldState(fieldName)?.value;
    const normalizedValue = value || '';
    
    if (currentValue !== normalizedValue) {
      form.change(fieldName, normalizedValue);
    }
  }, [form, fieldName, value]);

  return {
    // Helper to get current field value, ensuring it's always a string
    getValue: () => {
      const fieldState = form.getFieldState(fieldName);
      return fieldState?.value || '';
    },
    
    // Helper to set field value
    setValue: (newValue: string) => {
      form.change(fieldName, newValue);
    }
  };
};
