import {
  ChangeEvent,
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from 'react';
import styled from 'styled-components';
import { Row } from './Flex';

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledLabel = styled.label`
  font-size: 24px;
  color: var(--primary);
  flex-grow: 1;
  font-weight: 500;
  order: -1;
`;

const StyledField = styled(Row)`
  display: flex;
  gap: 1rem;
  align-items: center;

  &:hover > ${StyledLabel} {
    color: var(--accent);
    background: linear-gradient(
      90deg,
      transparent 5%,
      #5ff6ff1f,
      transparent 95%
    );
  }
`;

export const FormContext = createContext(undefined);

interface FormProps {
  initialValues: Record<string, string | number | boolean>;
  onValuesChange?: (
    values: Record<string, string | number | boolean>,
    name: string
  ) => void;
  onHover?: (name: string) => void;
}

export const Form = ({
  initialValues,
  children,
  onHover,
  onValuesChange,
}: PropsWithChildren<FormProps>) => {
  const [values, setValues] = useState(initialValues);

  return (
    <StyledForm>
      <FormContext.Provider
        value={{
          values,
          setValues,
          onHover,
          onValuesChange,
        }}
      >
        {children}
      </FormContext.Provider>
    </StyledForm>
  );
};

interface FieldContext<T> {
  name: string;
  value: T;
  setValue: (value: T, options?: { emit: boolean }) => void;
  onChange: (event: ChangeEvent<any>) => void;
}

const FieldContext = createContext<FieldContext<any>>(undefined);

export function useField<T>() {
  return useContext<FieldContext<T>>(FieldContext);
}

interface FieldProps {
  name: string;
  onValueChange?: (currentValue: any) => void;
}

export const Field = ({
  name,
  children,
  onValueChange,
}: PropsWithChildren<FieldProps>) => {
  const { values, setValues, onHover, onValuesChange } =
    useContext(FormContext);
  const value = values[name];

  function setValue(
    value: string | number | boolean,
    options = { emit: true }
  ) {
    const newValues = { ...values, [name]: value };
    setValues(newValues);

    if (options.emit) {
      if (onValueChange) onValueChange(value);
      if (onValuesChange) onValuesChange(newValues, name);
    }
  }

  function onChange(event: ChangeEvent<any>) {
    const { value, checked, type } = event.target;

    setValue(type === 'checkbox' ? checked : value);
  }

  return (
    <StyledField
      onMouseEnter={onHover ? () => onHover(name) : undefined}
      onMouseLeave={onHover ? () => onHover(null) : undefined}
    >
      <FieldContext.Provider
        value={{
          name,
          value,
          setValue,
          onChange,
        }}
      >
        {children}
      </FieldContext.Provider>
    </StyledField>
  );
};

export const Label = ({ children }: PropsWithChildren<{}>) => {
  const { name } = useContext(FieldContext);

  return <StyledLabel htmlFor={name}>{children}</StyledLabel>;
};
