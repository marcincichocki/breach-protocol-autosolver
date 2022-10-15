import {
  ChangeEvent,
  createContext,
  FormEvent,
  forwardRef,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useRef,
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

  > div {
    flex-shrink: 0;
  }

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

interface FormContext<T> {
  values: T;
  setFormValue: (
    name: keyof T,
    value: T[keyof T],
    options?: FieldOptions
  ) => void;
  onHover?: (name: keyof T) => void;
}

type ValueChangeListner<T> = (value: T[keyof T], name: keyof T) => void;

function useFieldValueChangeRegistry<T>(): FieldValueChangeRegistry<T> {
  const listeners = useRef(new Map<keyof T, ValueChangeListner<T>>());

  const addValueChangeListener = useCallback(
    (name: keyof T, cb: ValueChangeListner<T>) => {
      listeners.current.set(name, cb);
    },
    []
  );

  const removeValueChangeListener = useCallback((name: keyof T) => {
    listeners.current.delete(name);
  }, []);

  const emit = useCallback((name: keyof T, value: T[keyof T]) => {
    listeners.current.get(name)?.(value, name);
  }, []);

  return { addValueChangeListener, removeValueChangeListener, emit };
}

interface FieldValueChangeRegistry<T> {
  addValueChangeListener: (name: keyof T, cb: ValueChangeListner<T>) => void;
  removeValueChangeListener: (name: keyof T) => void;
  emit: (name: keyof T, value: T[keyof T]) => void;
}

const FieldValueChangeRegistryContext =
  createContext<FieldValueChangeRegistry<any>>(null);

const FormContext = createContext<FormContext<any>>(undefined);

export function useForm<T>() {
  return useContext<FormContext<T>>(FormContext);
}

interface FormProps<T> {
  initialValues: T;
  onValuesChange?: (values: T, name: keyof T) => void;
  onHover?: (name: keyof T) => void;
  onSubmit?: (values: T) => void;
}

export const Form = <T,>({
  initialValues,
  children,
  onHover,
  onValuesChange,
  onSubmit,
}: PropsWithChildren<FormProps<T>>) => {
  const [values, setValues] = useState(initialValues);
  const registry = useFieldValueChangeRegistry<T>();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    onSubmit(values);
  }

  const setFormValue = useCallback(
    (
      name: keyof T,
      value: T[keyof T],
      options: { emit?: boolean } = { emit: true }
    ) => {
      setValues((values) => {
        const newValues = { ...values, [name]: value };

        if (options.emit) {
          onValuesChange?.(newValues, name);
          registry.emit(name, value);
        }

        return newValues;
      });
    },
    []
  );

  return (
    <StyledForm onSubmit={onSubmit ? handleSubmit : undefined}>
      <FieldValueChangeRegistryContext.Provider value={registry}>
        <FormContext.Provider
          value={{
            values,
            setFormValue,
            onHover,
          }}
        >
          {children}
        </FormContext.Provider>
      </FieldValueChangeRegistryContext.Provider>
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
  onValueChange?: (currentValue: any, name: string) => void;
  render?: (props: { values: any }) => JSX.Element;
}

type FieldValue = string | number | boolean;
interface FieldOptions {
  emit?: boolean;
}

export const Field = forwardRef<HTMLDivElement, PropsWithChildren<FieldProps>>(
  ({ name, children, onValueChange, render }, ref) => {
    const { values, setFormValue, onHover } = useContext(FormContext);
    const { addValueChangeListener, removeValueChangeListener } = useContext(
      FieldValueChangeRegistryContext
    );
    const value = values[name];

    useEffect(() => {
      if (onValueChange) {
        addValueChangeListener(name, onValueChange);
      }

      return () => {
        if (onValueChange) {
          removeValueChangeListener(name);
        }
      };
    }, []);

    const setValue = useCallback(
      (value: FieldValue, options: FieldOptions = { emit: true }) => {
        setFormValue(name, value, options);
      },
      []
    );

    function onChange(event: ChangeEvent<any>) {
      const { value, checked, type } = event.target;

      setValue(type === 'checkbox' ? checked : value);
    }

    return (
      <StyledField
        id={name}
        ref={ref}
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
          {render ? render({ values }) : children}
        </FieldContext.Provider>
      </StyledField>
    );
  }
);

export const Label = ({ children }: PropsWithChildren<{}>) => {
  const { name } = useField();

  return <StyledLabel htmlFor={name}>{children}</StyledLabel>;
};

export type OnBeforeValueChange<T> = (
  newValue: T,
  next: (restart?: boolean) => void
) => void;
