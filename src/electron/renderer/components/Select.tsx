import { useState } from 'react';
import styled from 'styled-components';
import {
  ArrowLeft,
  ArrowLeftOutline,
  ArrowRight,
  ArrowRightOutline,
} from './Arrows';
import { OnBeforeValueChange, useField } from './Form';

const SelectWrapper = styled.div<{ disabled: boolean }>`
  display: flex;
  justify-content: ${(p) => (p.disabled ? 'center' : 'space-between')};
  width: 510px;
  height: 50px;
  background: var(--background);
  border: 1px solid var(--${(p) => (p.disabled ? 'disabled' : 'primary-dark')});
  box-sizing: border-box;
  color: var(--${(p) => (p.disabled ? 'disabled' : 'accent')});

  &[disabled] {
    cursor: not-allowed;
    background: var(--background-disabled);
  }

  &:hover:not([disabled]) {
    background: var(--primary-darker);
    border-color: var(--accent);
  }
`;

const SelectButton = styled.button.attrs({
  type: 'button',
})<{ disabled: boolean }>`
  border: none;
  background: none;
  color: inherit;
  font-size: 2.5em;
  padding: 0 1rem;
  display: ${(p) => (p.disabled ? 'none' : 'flex')};
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
  gap: 0.3rem;
`;

const SelectViewerOption = styled.div<{ active: boolean }>`
  width: 1.1rem;
  height: 4px;
  background: ${({ active }) => (active ? 'var(--primary)' : '#411518')};
`;

export interface SelectOption<T = any> {
  value: T;
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
  onBeforeValueChange?: OnBeforeValueChange<string>;
}

export const Select = ({
  options,
  disabled,
  onBeforeValueChange,
}: SelectProps) => {
  const { value, setValue, onChange } = useField<string>();

  // NOTE: this might cause error.
  const [index, setIndex] = useState<number>(
    value ? options.findIndex((o) => o.value === value) : 0
  );

  function update(dir: -1 | 1) {
    const nextIndex = index + dir;
    const next = () => {
      setValue(options[nextIndex].value);
      setIndex(nextIndex);
    };

    if (onBeforeValueChange) {
      onBeforeValueChange(options[nextIndex].value, next);
    } else {
      next();
    }
  }

  const prev = () => {
    if (!index) return;

    update(-1);
  };

  const next = () => {
    if (index === options.length - 1) return;

    update(1);
  };

  return (
    <SelectWrapper disabled={disabled}>
      <select hidden value={value} onChange={onChange}>
        {options.map(({ value }, i) => (
          <option key={i} value={value}></option>
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
