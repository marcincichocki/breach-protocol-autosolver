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
})<{ active: boolean }>`
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

export const Switch = ({ disabled }: SwitchProps) => {
  const { name, value, setValue, onChange } = useContext(FieldContext);

  return (
    <SwitchWrapper>
      <input type="checkbox" checked={value} onChange={onChange} hidden />
      <Off active={value} onClick={() => setValue(false)}>
        Off
      </Off>
      <On active={value} onClick={() => setValue(true)}>
        On
      </On>
    </SwitchWrapper>
  );
};
