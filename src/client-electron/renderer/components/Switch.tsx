import { useContext } from 'react';
import styled from 'styled-components';
import { FieldContext } from './Form';

interface SwitchProps {
  disabled?: boolean;
}

const SwitchWrapper = styled.div`
  display: flex;
  gap: 10px;
  width: 510px;
`;

const SwitchButton = styled.button.attrs({
  type: 'button',
})<{ active: boolean; disabled: boolean }>`
  flex-grow: 1;
  height: 50px;
  border: 1px solid;
  font-size: 24px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  text-transform: uppercase;
  outline: none;
  font-family: Rajdhani;
  cursor: pointer;

  &[disabled] {
    cursor: not-allowed;
  }
`;

const Off = styled(SwitchButton)`
  background: ${(p) => (p.active ? '#190a10' : '#932c2a')};
  border-color: ${(p) => (p.active ? '#3a1216' : 'var(--primary)')};
  color: ${(p) => (p.active ? '#3a1216' : '#ff7265')};

  &[disabled] {
    background: ${(p) => (p.active ? '#06080f' : 'var(--background-disabled)')};
    border-color: ${(p) => (p.active ? '#1a1719' : 'var(--disabled)')};
    color: ${(p) => (p.active ? '#1a1719' : 'var(--disabled)')};
  }
`;

const On = styled(SwitchButton)`
  background: ${(p) => (p.active ? 'var(--accent)' : '#0a1d1f')};
  border-color: ${(p) => (p.active ? 'var(--accent)' : '#113032')};
  color: ${(p) => (p.active ? '#000' : '#113032')};

  &[disabled] {
    background: ${(p) => (p.active ? 'var(--background-disabled)' : '#06080f')};
    border-color: ${(p) => (p.active ? 'var(--disabled)' : '#1a1719')};
    color: ${(p) => (p.active ? 'var(--disabled)' : '#1a1719')};
  }
`;

export const Switch = ({ disabled }: SwitchProps) => {
  const { name, value, setValue, onChange } = useContext(FieldContext);

  return (
    <SwitchWrapper>
      <input
        type="checkbox"
        checked={value}
        onChange={onChange}
        disabled={disabled}
        hidden
      />
      <Off disabled={disabled} active={value} onClick={() => setValue(false)}>
        Off
      </Off>
      <On disabled={disabled} active={value} onClick={() => setValue(true)}>
        On
      </On>
    </SwitchWrapper>
  );
};
