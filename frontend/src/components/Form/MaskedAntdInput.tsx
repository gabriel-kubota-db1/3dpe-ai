import React, { useState, useEffect, useRef } from 'react';
import { Input } from 'antd';
import type { InputProps } from 'antd';

type MaskPattern = string | Array<{ mask: string; maxLength?: number }>;

interface MaskedAntdInputProps extends Omit<InputProps, 'value' | 'onChange'> {
  mask: MaskPattern;
  unmask?: boolean;
  value?: string;
  onChange?: (value: string) => void;
  onAccept?: (value: string) => void;
}

export const MaskedAntdInput: React.FC<MaskedAntdInputProps> = ({
  mask,
  unmask = false,
  value = '',
  onChange,
  onAccept,
  ...inputProps
}) => {
  const [displayValue, setDisplayValue] = useState('');
  const inputRef = useRef<any>(null);
  const isComposing = useRef(false);
  const pendingCursorPosition = useRef<number | null>(null);

  // Get the appropriate mask based on input length
  const getActiveMask = (inputValue: string): string => {
    if (typeof mask === 'string') {
      return mask;
    }
    
    // For array of masks, choose based on length or maxLength
    const cleanDigits = inputValue.replace(/\D/g, '');
    
    for (const maskOption of mask) {
      if (maskOption.maxLength && cleanDigits.length <= maskOption.maxLength) {
        return maskOption.mask;
      }
    }
    
    // Default to last mask if no match
    return mask[mask.length - 1].mask;
  };

  // Apply mask to a value
  const applyMask = (inputValue: string, maskPattern: string): string => {
    if (!inputValue) return '';
    
    // Remove all non-numeric characters for processing
    const cleanValue = inputValue.replace(/\D/g, '');
    
    // Count the number of digit placeholders in the mask
    const maxDigits = maskPattern.split('').filter(char => char === '0').length;
    
    // Limit clean value to the maximum number of digits allowed by the mask
    const limitedCleanValue = cleanValue.slice(0, maxDigits);
    
    let masked = '';
    let valueIndex = 0;
    
    for (let i = 0; i < maskPattern.length && valueIndex < limitedCleanValue.length; i++) {
      const maskChar = maskPattern[i];
      
      if (maskChar === '0') {
        // Placeholder for digit
        if (valueIndex < limitedCleanValue.length) {
          masked += limitedCleanValue[valueIndex];
          valueIndex++;
        }
      } else {
        // Fixed character in mask
        masked += maskChar;
      }
    }
    
    return masked;
  };

  // Remove mask from value
  const removeMask = (maskedValue: string): string => {
    return maskedValue.replace(/\D/g, '');
  };

  // Update display value when external value changes
  useEffect(() => {
    if (value !== undefined) {
      const activeMask = getActiveMask(value);
      const newDisplayValue = applyMask(value, activeMask);
      setDisplayValue(newDisplayValue);
    }
  }, [value, mask]);

  // Restore cursor position after state update
  useEffect(() => {
    if (inputRef.current && !isComposing.current && pendingCursorPosition.current !== null) {
      // Use a small delay to ensure the DOM has updated
      setTimeout(() => {
        if (inputRef.current && pendingCursorPosition.current !== null) {
          inputRef.current.setSelectionRange(pendingCursorPosition.current, pendingCursorPosition.current);
          pendingCursorPosition.current = null;
        }
      }, 0);
    }
  }, [displayValue]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isComposing.current) return;

    const inputValue = e.target.value;
    const currentCursorPos = e.target.selectionStart || 0;
    
    // Get clean numeric value from input
    let cleanValue = removeMask(inputValue);
    
    // Get the previous clean value for comparison
    const previousCleanValue = removeMask(displayValue);
    
    // Apply appropriate mask
    const activeMask = getActiveMask(cleanValue);
    
    // Count the number of digit placeholders in the active mask to limit input
    const maxDigits = activeMask.split('').filter(char => char === '0').length;
    
    // Limit clean value to the maximum number of digits allowed by the mask
    cleanValue = cleanValue.slice(0, maxDigits);
    
    const maskedValue = applyMask(cleanValue, activeMask);
    
    // Calculate new cursor position based on the number of digits added/removed
    let newCursorPos = currentCursorPos;
    
    if (cleanValue.length > previousCleanValue.length) {
      // User added a digit - find the correct position after masking
      // Start from the current cursor position and find where the new digits should be
      let digitCount = 0;
      let targetPos = 0;
      
      for (let i = 0; i < maskedValue.length; i++) {
        const maskChar = activeMask[i];
        if (maskChar === '0') {
          digitCount++;
          if (digitCount === cleanValue.length) {
            targetPos = i + 1;
            break;
          }
        }
      }
      
      newCursorPos = targetPos;
    } else if (cleanValue.length < previousCleanValue.length) {
      // User removed a digit - position cursor after the last remaining digit
      if (cleanValue.length === 0) {
        newCursorPos = 0;
      } else {
        let digitCount = 0;
        let targetPos = 0;
        
        for (let i = 0; i < maskedValue.length; i++) {
          const maskChar = activeMask[i];
          if (maskChar === '0') {
            digitCount++;
            if (digitCount === cleanValue.length) {
              targetPos = i + 1;
              break;
            }
          }
        }
        
        newCursorPos = targetPos;
      }
    } else {
      // Same length - try to maintain relative position
      newCursorPos = Math.min(currentCursorPos, maskedValue.length);
    }
    
    setDisplayValue(maskedValue);
    pendingCursorPosition.current = newCursorPos;
    
    // Call onChange with the appropriate value (masked or unmasked)
    const outputValue = unmask ? cleanValue : maskedValue;
    if (onChange) {
      onChange(outputValue);
    }
    if (onAccept) {
      onAccept(outputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.target as HTMLInputElement;
    const currentCursorPos = input.selectionStart || 0;
    const activeMask = getActiveMask(displayValue);
    
    // Handle arrow keys to skip over mask characters
    if (e.key === 'ArrowLeft' && currentCursorPos > 0) {
      const charAtCursor = activeMask[currentCursorPos - 1];
      if (charAtCursor && charAtCursor !== '0') {
        e.preventDefault();
        let newPos = currentCursorPos - 1;
        // Keep moving left until we find a digit position
        while (newPos > 0 && activeMask[newPos - 1] !== '0') {
          newPos--;
        }
        setTimeout(() => {
          input.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
    
    if (e.key === 'ArrowRight' && currentCursorPos < displayValue.length) {
      const charAtCursor = activeMask[currentCursorPos];
      if (charAtCursor && charAtCursor !== '0') {
        e.preventDefault();
        let newPos = currentCursorPos + 1;
        // Keep moving right until we find a digit position or end
        while (newPos < activeMask.length && activeMask[newPos] !== '0') {
          newPos++;
        }
        setTimeout(() => {
          input.setSelectionRange(newPos, newPos);
        }, 0);
      }
    }
    
    // Let backspace and delete work naturally - they'll trigger handleInputChange
    // which will properly recalculate the cursor position
  };

  const handleCompositionStart = () => {
    isComposing.current = true;
  };

  const handleCompositionEnd = (e: React.CompositionEvent<HTMLInputElement>) => {
    isComposing.current = false;
    handleInputChange(e as any);
  };

  return (
    <Input
      {...inputProps}
      ref={inputRef}
      value={displayValue}
      onChange={handleInputChange}
      onKeyDown={handleKeyDown}
      onCompositionStart={handleCompositionStart}
      onCompositionEnd={handleCompositionEnd}
    />
  );
};
