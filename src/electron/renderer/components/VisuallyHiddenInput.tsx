import styled from 'styled-components';

export const VisuallyHiddenInput = styled.input`
  border: 0;
  clip: rect(0 0 0 0);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  padding: 0;
  position: absolute;
  width: 1px;
  white-space: nowrap;
  outline: 0;
  appearance: none;
  top: 0;
  left: 0;

  &:focus-visible + label {
    outline: 2px solid var(--outline);
    outline-offset: 2px;
  }
`;
