import { FC, HTMLProps, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  ArrowLeft,
  ArrowLeftOutline,
  ArrowRight,
  ArrowRightOutline,
} from './Arrows';

const SelectWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 510px;
  height: 40px;
  background: var(--background);
  border: 1px solid var(--primary-dark);
  box-sizing: border-box;
  padding: 0 2rem;

  &:hover {
    background: var(--primary-darker);
    border: 1px solid var(--accent);
  }
`;

const SelectButton = styled.button`
  border: none;
  background: none;
  color: var(--accent);
  font-size: 2.5em;
  padding: 0;
  display: flex;
  align-items: center;
  outline: none;
  cursor: pointer;

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
  justify-content: center;
`;

const SelectViewerValue = styled.span`
  color: var(--accent);
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

const SelectViewer: FC<SelectViewerProps> = ({ options, index }) => (
  <SelectViewerWrapper>
    <SelectViewerValue>{options[index].name}</SelectViewerValue>
    <SelectViewerOptions>
      {options.map((option, i) => (
        <SelectViewerOption key={i} active={index === i}></SelectViewerOption>
      ))}
    </SelectViewerOptions>
  </SelectViewerWrapper>
);

interface SelectProps extends HTMLProps<HTMLSelectElement> {
  options: SelectOption[];
}

export const Select: FC<SelectProps> = ({ options, value, ...props }) => {
  const ref = useRef<HTMLSelectElement>();
  const [index, setIndex] = useState<number>(
    value ? options.findIndex((o) => o.value === value.toString()) : 0
  );

  const dispatchChangeEvent = () => {
    const event = new Event('change', { bubbles: true });
    ref.current.dispatchEvent(event);
  };

  const selectOption = (index: number) => {
    ref.current.selectedIndex = index;
    setIndex(ref.current.selectedIndex);
  };

  const prev = () => {
    if (!ref.current.selectedIndex) return;

    selectOption(ref.current.selectedIndex - 1);
    dispatchChangeEvent();
  };

  const next = () => {
    if (ref.current.selectedIndex === options.length - 1) return;

    selectOption(ref.current.selectedIndex + 1);
    dispatchChangeEvent();
  };

  return (
    <SelectWrapper>
      <select ref={ref} defaultValue={value} {...props} hidden>
        {options.map(({ name, value }) => (
          <option key={value} value={value}>
            {name}
          </option>
        ))}
      </select>
      <SelectButton onClick={prev}>
        <ArrowLeftOutline />
        <ArrowLeft />
      </SelectButton>
      <SelectViewer options={options} index={index} />
      <SelectButton onClick={next}>
        <ArrowRightOutline />
        <ArrowRight />
      </SelectButton>
    </SelectWrapper>
  );
};
