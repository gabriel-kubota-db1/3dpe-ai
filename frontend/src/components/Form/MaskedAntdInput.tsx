import { Input } from 'antd';
import { useIMask } from 'react-imask';
import { useEffect } from 'react';
import type { InputProps } from 'antd';
import type { FactoryOpts } from 'imask';

type MaskedAntdInputProps = Omit<InputProps, 'onChange' | 'value'> & {
  mask: FactoryOpts['mask'];
  unmask?: FactoryOpts['unmask'];
  onAccept?: (value: any, mask: any) => void;
  value?: string;
  onChange?: (event: any) => void; // For react-final-form
  name?: string;
};

export const MaskedAntdInput = ({
  onChange,
  onAccept,
  value,
  name,
  mask,
  unmask,
  ...props // The rest are Antd Input props
}: MaskedAntdInputProps) => {
  const { ref, maskRef } = useIMask({
    mask,
    unmask,
  }, {
    onAccept: (acceptedValue, maskInstance) => {
      // For react-final-form, we call onChange with the raw value
      if (onChange) {
        onChange(acceptedValue);
      }
      // For any other side-effects
      if (onAccept) {
        onAccept(acceptedValue, maskInstance);
      }
    },
  });

  // Sync the external value (from final-form) with the mask's internal value
  useEffect(() => {
    if (maskRef.current) {
      if (value !== undefined && value !== null) {
        maskRef.current.value = String(value);
      } else {
        // Handle clearing the input
        maskRef.current.value = '';
      }
    }
  }, [value, maskRef]);

  return <Input {...props} name={name} ref={ref as React.Ref<any>} />;
};
