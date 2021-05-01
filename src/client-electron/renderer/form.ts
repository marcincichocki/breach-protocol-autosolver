import { useState } from 'react';

function useFormControl<N extends string, T>(
  name: N,
  initialValue: T
): FormControl<N> {
  const [value, setValue] = useState(initialValue);

  const onChange = (event: any) => {
    const { type, checked, value } = event.target;

    setValue(type === 'checkbox' ? checked : value);
  };

  return {
    name,
    onChange,
    value: value.toString(),
    checked: !!value,
  };
}

interface FormControl<N extends string> {
  name: N;
  onChange: (event: any) => void;
  value: string;
  checked: boolean;
}

export function useForm<T extends Record<string, string | number | boolean>>(
  initialValues: T
) {
  const form = {} as { [K in keyof T]: FormControl<string> };
  const values = {} as { [K in keyof T]: T[K] };

  for (const key in initialValues) {
    if (!initialValues.hasOwnProperty(key)) continue;

    const value = initialValues[key];
    const control = useFormControl(key, value);
    const prop = typeof value === 'boolean' ? 'checked' : 'value';
    const controlValue =
      typeof value === 'number' ? Number(control.value) : control[prop];

    form[key] = control;
    values[key] = controlValue as any;
  }

  return { form, values };
}
