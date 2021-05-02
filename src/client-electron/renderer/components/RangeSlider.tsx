import { FC, HTMLProps, useRef, useState } from 'react';
import styled from 'styled-components';

const Range = styled.input`
  appearance: none;
  background: var(--background);
  border: 1px solid var(--primary-dark);
  width: 100%;
  height: 40px;
  outline: none;
  box-sizing: border-box;
  margin: 0;

  &:hover {
    background: var(--primary-darker);
    border: 1px solid var(--accent);
  }

  &::-webkit-slider-runnable-track {
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

interface RangeSliderProps extends HTMLProps<HTMLInputElement> {}

export const RangeSlider: FC<RangeSliderProps> = ({
  name,
  min,
  max,
  value,
  onChange,
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(value);

  return (
    <RangeWrapper>
      <Range
        ref={ref}
        type="range"
        name={name}
        min={min}
        max={max}
        defaultValue={value}
        onMouseUp={onChange}
        onKeyUp={onChange}
        onChange={(e) => setCurrentValue(+e.target.value)}
        step={1}
      />
      <RangeValue>{currentValue}</RangeValue>
    </RangeWrapper>
  );
};
