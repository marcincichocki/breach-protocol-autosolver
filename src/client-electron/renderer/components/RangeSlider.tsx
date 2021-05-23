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
  background: ${({ disabled }) => (disabled ? 'gray' : 'var(--background)')};
  border: 1px solid var(--primary-dark);
  width: 100%;
  height: 40px;
  outline: none;
  box-sizing: border-box;
  margin: 0;

  &:hover:not([disabled]) {
    background: var(--primary-darker);
    border: 1px solid var(--accent);
  }

  &::-webkit-slider-thumb {
    appearance: none;
    height: 40px;
    width: 40px;
    border: 2px solid var(--primary);
    background: #942f2f;
    cursor: pointer;
  }
`;

const RangeWrapper = styled.div`
  width: 510px;
  height: 40px;
  position: relative;
`;

const RangeValue = styled.output`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate3d(-50%, -50%, 0);
  font-family: 'Rajdhani';
  color: var(--accent);
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
    <RangeWrapper>
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
