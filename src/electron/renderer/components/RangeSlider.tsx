import { VK_ENTER } from '@/common';
import { ChangeEvent, KeyboardEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import { OnBeforeValueChange, useField } from './Form';

interface RangeSliderProps {
  onBeforeValueChange?: OnBeforeValueChange<number>;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

const Range = styled.input.attrs<RangeSliderProps>({ type: 'range' })`
  appearance: none;
  background: var(--background);
  border: 1px solid var(--${(p) => (p.disabled ? 'disabled' : 'primary-dark')});
  width: 100%;
  height: 50px;
  outline: none;
  box-sizing: border-box;
  margin: 0;

  &[disabled] {
    cursor: not-allowed;
    background: var(--background-disabled);
  }

  &:hover:not([disabled]) {
    background: var(--primary-darker);
    border: 1px solid var(--accent);
  }

  &::-webkit-slider-thumb {
    display: ${(p) => (p.disabled ? 'none' : 'block')};
    appearance: none;
    height: 50px;
    width: 50px;
    border: 2px solid var(--primary);
    background: #942f2f;
    cursor: pointer;
  }
`;

const RangeWrapper = styled.div<{ disabled: boolean }>`
  width: 510px;
  height: 50px;
  position: relative;
  color: var(--${(p) => (p.disabled ? 'disabled' : 'accent')});
`;

const RangeValue = styled.output`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-family: 'Rajdhani';
  font-weight: 500;
  font-size: 24px;
  pointer-events: none;
`;

function coerceInputValue(e: ChangeEvent<HTMLInputElement>) {
  return parseInt(e.target.value, 10);
}

export function RangeSlider({
  onBeforeValueChange,
  ...props
}: RangeSliderProps) {
  const { value, setValue } = useField<number>();
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  function onValueChange(e: any) {
    const newValue = coerceInputValue(e);
    const next = (restart?: boolean) =>
      restart ? setDisplayValue(value) : setValue(newValue);

    if (onBeforeValueChange) {
      onBeforeValueChange(newValue, next);
    } else {
      next();
    }
  }

  function setValueOnEnter(e: KeyboardEvent) {
    if (e.code === VK_ENTER) {
      onValueChange(e);
    }
  }

  return (
    <RangeWrapper disabled={props.disabled}>
      <Range
        {...props}
        value={displayValue}
        onChange={(e) => setDisplayValue(coerceInputValue(e))}
        onMouseUp={onValueChange}
        onKeyUp={setValueOnEnter}
      />
      <RangeValue>{displayValue}</RangeValue>
    </RangeWrapper>
  );
}

export const ThresholdSlider = (props: RangeSliderProps) => (
  <RangeSlider {...props} min={0} max={255} step={1} />
);
