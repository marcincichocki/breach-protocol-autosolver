import { useContext, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowLeft,
  ArrowLeftOutline,
  ArrowRight,
  ArrowRightOutline,
} from './Arrows';
import { FieldContext } from './Form';

const SelectWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: space-between;
  width: 510px;
  height: 50px;
  background: ${({ disabled }) => (disabled ? 'gray' : 'var(--background)')};
  border: 1px solid var(--primary-dark);
  box-sizing: border-box;
  color: ${({ disabled }) => (disabled ? 'darkgray' : 'var(--accent)')};

  &:hover:not([disabled]) {
    background: var(--primary-darker);
    border: 1px solid var(--accent);
  }
`;

const SelectButton = styled.button.attrs({
  type: 'button',
})<{ disabled: boolean }>`
  border: none;
  background: none;
  color: inherit;
  font-size: 2.5em;
  padding: 0 2rem;
  display: flex;
  align-items: center;
  outline: none;
  cursor: pointer;
  pointer-events: ${({ disabled }) => (disabled ? 'none' : 'auto')};

  > .arrow {
    display: none;
  }

  &:hover {
    > .arrow {
      display: block;
    }

    > .arrow-outline {
      display: none;
    }
  }
`;

const SelectViewerWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-evenly;
`;

const SelectViewerValue = styled.span`
  font-weight: 500;
  font-size: 24px;
  line-height: 1.1;
`;

const SelectViewerOptions = styled.div`
  display: flex;
  gap: 10px;
`;

const SelectViewerOption = styled.div<{ active: boolean }>`
  width: 40px;
  height: 4px;
  background: ${({ active }) => (active ? 'var(--primary)' : '#411518')};
`;

interface SelectOption {
  value: string;
  name: string;
}

interface SelectViewerProps {
  options: SelectOption[];
  index: number;
}

const SelectViewer = ({ options, index }: SelectViewerProps) => (
  <SelectViewerWrapper>
    <SelectViewerValue>{options[index].name}</SelectViewerValue>
    <SelectViewerOptions>
      {options.map((option, i) => (
        <SelectViewerOption key={i} active={index === i}></SelectViewerOption>
      ))}
    </SelectViewerOptions>
  </SelectViewerWrapper>
);

interface SelectProps {
  options: SelectOption[];
  disabled?: boolean;
}

export const Select = ({ options, disabled }: SelectProps) => {
  const { value, setValue, onChange } = useContext(FieldContext);

  // NOTE: this might cause error.
  const [index, setIndex] = useState<number>(
    value ? options.findIndex((o) => o.value === value) : 0
  );

  const prev = () => {
    if (!index) return;

    setIndex(index - 1);
    setValue(options[index - 1].value);
  };

  const next = () => {
    if (index === options.length - 1) return;

    setIndex(index + 1);
    setValue(options[index + 1].value);
  };

  return (
    <SelectWrapper disabled={disabled}>
      <select hidden value={value} onChange={onChange}>
        {options.map(({ value }) => (
          <option key={value} value={value}></option>
        ))}
      </select>
      <SelectButton onClick={prev} disabled={disabled}>
        <ArrowLeftOutline />
        <ArrowLeft />
      </SelectButton>
      <SelectViewer options={options} index={index} />
      <SelectButton onClick={next} disabled={disabled}>
        <ArrowRightOutline />
        <ArrowRight />
      </SelectButton>
    </SelectWrapper>
  );
};
