import styled from 'styled-components';

export interface SquareProps {
  active: boolean;
  highlight?: boolean;
  spotlight?: boolean;
  hasDaemon: boolean;
}

export function getSquareColor(
  highlightColor: string,
  defaultColor = 'transparent'
) {
  return ({ active, highlight, spotlight, hasDaemon }: SquareProps) => {
    if (spotlight) {
      return 'var(--primary)';
    }

    if (active) {
      if (highlight) {
        return highlightColor;
      }

      if (hasDaemon) {
        return 'var(--accent)';
      }

      return 'var(--accent-dark)';
    }

    return defaultColor;
  };
}

export const Square = styled.div<SquareProps>`
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--square);
  height: var(--square);
  font-size: 22px;
  font-weight: 500;
  position: relative;
  flex-shrink: 0;

  @media (min-width: 1280px) {
    font-size: 24px;
  }
`;
