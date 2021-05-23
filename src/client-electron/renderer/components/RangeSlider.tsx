import { useContext, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FieldContext } from './Form';

interface RangeSliderProps {
  disabled?: boolean;
  min?: number;
  max?: number;
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

export function RangeSlider(props: RangeSliderProps) {
  const { value, setValue } = useContext(FieldContext);
  const [displayValue, setDisplayValue] = useState(value);

  function setCoercedValue(e: any) {
    return setValue(parseInt(e.target.value, 10));
  }

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <RangeWrapper disabled={props.disabled}>
      <Range
        {...props}
        value={displayValue}
        onChange={(e) => setDisplayValue(e.target.value)}
        onMouseUp={setCoercedValue}
        onKeyUp={setCoercedValue}
      />
      <RangeValue>{displayValue}</RangeValue>
    </RangeWrapper>
  );
}
