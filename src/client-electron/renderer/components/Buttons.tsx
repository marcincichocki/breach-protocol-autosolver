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
  text-decoration: underline;
  cursor: pointer;
  font-family: Rajdhani;
  font-size: 1rem;
`;
