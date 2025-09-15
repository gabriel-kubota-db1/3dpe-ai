import { Input } from 'antd';
import { useIMask } from 'react-imask';
import { useEffect } from 'react';
import type { InputProps } from 'antd';
import type { FactoryOpts } from 'imask';

type MaskedAntdInputProps = Omit<InputProps, 'onChange' | 'value'> & {
  mask: FactoryOpts['mask'];
  unmask?: boolean; // if true, onAccept returns unmasked value
  onAccept?: (value: any, mask: any) => void;
  value?: string;
  onChange?: (event: any) => void;
  name?: string;
};

export const MaskedAntdInput = ({
  onChange,
  onAccept,
  value,
  name,
  ...props
}: MaskedAntdInputProps) => {
  const { ref, maskRef } = useIMask(props, {
    onAccept: (acceptedValue, mask) => {
      if (onChange) {
        // react-final-form's Field expects an event-like object or the raw value.
        // Passing the raw value is simpler.
        onChange(acceptedValue);
      }
      if (onAccept) {
        onAccept(acceptedValue, mask);
      }
    },
  });

  // Sync the external value (from final-form) with the mask's internal value
  useEffect(() => {
    if (maskRef.current && value !== undefined && value !== null) {
      maskRef.current.value = String(value);
    }
  }, [value, maskRef]);

  return <Input {...props} name={name} ref={ref as React.Ref<any>} />;
};
