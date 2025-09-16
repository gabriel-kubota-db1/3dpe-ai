// Test file to verify MaskedAntdInput behavior
// This is for development/testing purposes only

/*
Test Cases for the new MaskedAntdInput:

1. Document (CPF/CNPJ) Field:
   - Input: "12345678901" → Output: "123.456.789-01" (CPF format)
   - Input: "12345678000195" → Output: "12.345.678/0001-95" (CNPJ format)
   - Unmask=true should return: "12345678901" or "12345678000195"

2. Phone Field:
   - Input: "1199998888" → Output: "(11) 9999-8888" (landline format)
   - Input: "11999998888" → Output: "(11) 99999-8888" (mobile format)

3. CEP Field:
   - Input: "01234567" → Output: "01234-567"

4. Cursor Behavior:
   - Typing should not cause digits to be erased
   - Cursor should skip over mask characters (dots, dashes, etc.)
   - Backspace should properly handle mask characters

5. Initial Values:
   - When editing a user, existing values should display correctly
   - Form should populate with properly formatted values

Expected Improvements:
- No more digit rollback when typing
- Smooth cursor movement
- Proper integration with react-final-form
- Correct initial value display for edit mode
*/

export const MaskedInputTests = {
  documentMask: [
    {
      mask: '000.000.000-00',
      maxLength: 11,
    },
    {
      mask: '00.000.000/0000-00',
    },
  ],
  
  phoneMask: [
    {
      mask: '(00) 0000-0000',
    },
    {
      mask: '(00) 00000-0000',
    },
  ],
  
  cepMask: '00000-000',
};
