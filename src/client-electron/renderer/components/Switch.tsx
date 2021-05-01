import { FC, HTMLProps, useRef, useState } from 'react';
import styled from 'styled-components';

interface SwitchProps extends HTMLProps<HTMLInputElement> {}

const SwitchWrapper = styled.div`
  display: flex;
  gap: 10px;
  width: 510px;
`;

const SwitchButton = styled.button<{ active: boolean }>`
  flex-grow: 1;
  height: 40px;
  border: 1px solid;
  font-size: 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  outline: none;
  font-family: Rajdhani;
  cursor: pointer;
`;

const Off = styled(SwitchButton)`
  background: ${(p) => (p.active ? '#190a10' : 'var(--primary)')};
  border-color: ${({ active }) => (active ? '#3a1216' : 'var(--primary)')};
  color: ${({ active }) => (active ? '#3a1216' : '#ff7166')};
`;

const On = styled(SwitchButton)`
  background: ${({ active }) => (active ? 'var(--accent)' : '#0a1d1f')};
  border-color: ${({ active }) => (active ? 'var(--accent)' : '#113032')};
  color: ${({ active }) => (active ? '#000' : '#113032')};
`;

export const Switch: FC<SwitchProps> = ({ name, onChange, checked }) => {
  const ref = useRef<HTMLInputElement>(null);
  const [currentValue, setCurrentValue] = useState(checked);

  const dispatchChangeEvent = () => {
    const event = new Event('click', { bubbles: true });

    ref.current.dispatchEvent(event);
  };

  const change = (value: boolean) => {
    if (ref.current.checked === value) return;

    ref.current.checked = !!value;
    setCurrentValue(ref.current.checked);

    dispatchChangeEvent();
  };

  return (
    <SwitchWrapper>
      <input
        ref={ref}
        type="checkbox"
        name={name}
        defaultChecked={checked}
        onClick={onChange}
        hidden
      />
      <Off active={currentValue} onClick={() => change(false)}>
        Off
      </Off>
      <On active={currentValue} onClick={() => change(true)}>
        On
      </On>
    </SwitchWrapper>
  );
};
