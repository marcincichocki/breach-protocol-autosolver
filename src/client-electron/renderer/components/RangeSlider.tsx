import { ChangeEvent } from 'react';
import styled from 'styled-components';

interface RangeSliderProps {
  value?: string | number;
  name?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  onChange?: (event: ChangeEvent<HTMLInputElement>) => void;
  onValueChange?: (value: number) => void;
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

export function RangeSlider({ onValueChange, ...props }: RangeSliderProps) {
  return (
    <RangeWrapper>
      <Range
        {...props}
        onMouseUp={() => onValueChange(+props.value)}
        onKeyUp={() => onValueChange(+props.value)}
        step={1}
      />
      <RangeValue>{props.value}</RangeValue>
    </RangeWrapper>
  );
}
