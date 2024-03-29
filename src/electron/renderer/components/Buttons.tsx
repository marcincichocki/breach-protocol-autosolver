import styled from 'styled-components';

interface ButtonProps {
  color: 'primary' | 'accent';
}

const Base = styled.button`
  --disabled: gray;

  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: none;
  border: none;
  font-size: 24px;
  font-weight: 500;
  color: #fff;
  font-family: Rajdhani;
  min-width: 200px;
  text-transform: uppercase;
  outline: none;
  cursor: pointer;
  text-decoration: none;

  &[disabled] {
    cursor: not-allowed;
  }
`;

export const StrokedButton = styled(Base)`
  border: 1px solid;
  border-color: ${({ color }) => `var(--${color})`};
  color: ${({ color }) => `var(--${color})`};

  &[disabled] {
    color: gray;
    border-color: var(--disabled);
  }

  &:hover:not([disabled]) {
    color: ${({ color }) =>
      color === 'primary' ? 'var(--primary-dark)' : 'pink'};
    border-color: ${({ color }) =>
      color === 'primary' ? 'var(--primary-dark)' : 'pink'};
  }
`;

export const FlatButton = styled(Base)<ButtonProps>`
  background: ${({ color }) => `var(--${color})`};
  color: var(--background);

  &[disabled] {
    color: var(--disabled);
    background: darkgray;
  }
`;

export const LinkButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: var(--accent);
  cursor: pointer;
  font-family: Rajdhani;
  font-size: 1rem;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export const ClearButton = styled.button`
  height: 50px;
  width: 50px;
  border: 2px solid var(--primary);
  color: var(--primary);
  background: #942f2f;
  cursor: pointer;

  &:hover {
    color: var(--accent);
    border-color: var(--accent);
    background: var(--accent-dark);
  }
`;
