import {
  COLS,
  cross,
  GapDirection,
  GapOrientation,
  getGap,
  GridRawData,
  ROWS,
} from '@/core';
import styled, { css } from 'styled-components';
import { Highlight } from './HistoryViewer';

const cssVars = { size: 5, gutter: 16, square: 40, border: 1 };
const cssVarsHighlight = { size: 7, border: 4 };

const GridWrapper = styled.div<{ size: number }>`
  --size: ${cssVars.size}px;
  --gutter: ${cssVars.gutter}px;
  --square: ${cssVars.square}px;
  --border: ${cssVars.border}px;

  width: 376px;
  height: 376px;
  display: inline-grid;
  grid-gap: var(--gutter);
  padding: var(--gutter);
  background: var(--background);
  border: 1px solid var(--primary);
  grid-template-columns: repeat(${(props) => props.size}, max-content);
  grid-template-rows: repeat(${(props) => props.size}, max-content);
  position: relative;
  z-index: 0;
`;

const Square = styled.div<{ active: boolean; highlight: boolean }>`
  ${(p) =>
    p.highlight &&
    css`
      --border: ${cssVarsHighlight.border}px;
      --size: ${cssVarsHighlight.size}px;
    `}

  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ active, highlight }) =>
    active ? (highlight ? 'var(--background)' : 'var(--accent)') : '#1a2424'};
  width: var(--square);
  height: var(--square);
  font-size: 24px;
  font-weight: 500;
  position: relative;
  z-index: ${({ active }) => (active ? 'auto' : '-3')};
  background: ${({ highlight }) =>
    highlight ? 'var(--accent)' : 'var(--background)'};
  border: var(--border) solid
    ${({ active }) => (active ? 'var(--accent)' : 'transparent')};
`;

function getArrowBorderFor(d: GapDirection) {
  const o: GapOrientation =
    d === 'bottom' || d === 'top' ? 'horizontal' : 'vertical';

  return ({ dir, orientation }: LineProps) => {
    const transparent = 'var(--size) solid transparent';
    const solid = 'var(--size) solid';
    const none = 'none';

    return dir === d ? none : orientation === o ? transparent : solid;
  };
}

function getArrowPosition({ dir, orientation }: LineProps) {
  const offset = 'var(--size) * -1';
  const center = orientation === 'vertical' ? 'left' : 'top';

  return `
    position: absolute;
    ${dir}: calc(${offset});
    ${center}: calc(${offset} + var(--border) / 2);
  `;
}

function getLineSizeFor(o: GapOrientation) {
  return ({ offset, orientation }: LineProps) => {
    const absOffset = Math.abs(offset);
    const squareSize = `var(--square) * ${absOffset - 1}`;
    const gutterSize = `var(--gutter) * ${absOffset}`;

    return orientation === o
      ? 'var(--border)'
      : `calc(${squareSize} + ${gutterSize} - var(--size))`;
  };
}

function getLinePosition({ dir, ignore }: LineProps) {
  const borderSize = ignore ? `${cssVarsHighlight.border}px` : 'var(--border)';

  return `${dir}: calc(var(--square) + var(--size) - ${borderSize})`;
}

const arrowBorders = css`
  border-top: ${getArrowBorderFor('top')};
  border-right: ${getArrowBorderFor('right')};
  border-bottom: ${getArrowBorderFor('bottom')};
  border-left: ${getArrowBorderFor('left')};
`;

interface LineProps {
  offset: number;
  dir: GapDirection;
  orientation: GapOrientation;
  ignore: boolean;
}

const Line = styled.div<LineProps>`
  ${(p) =>
    p.ignore &&
    css`
      --border: ${cssVars.border}px;
      --size: ${cssVars.size}px;
    `}

  color: var(--accent);
  pointer-events: none;
  position: absolute;
  background: var(--accent);
  z-index: -1;
  width: ${getLineSizeFor('vertical')};
  height: ${getLineSizeFor('horizontal')};
  ${getLinePosition};

  &::after {
    content: '';
    ${arrowBorders}
    ${getArrowPosition}
  }
`;

interface GridViewerProps {
  grid: GridRawData;
  path: string[];
  highlight?: Highlight;
}

export const GridViewer = ({ grid, path, highlight }: GridViewerProps) => {
  const size = Math.sqrt(grid.length);
  const squares = cross(ROWS.slice(0, size), COLS.slice(0, size));

  return (
    <GridWrapper size={size}>
      {squares.map((s, i) => {
        const value = grid[i];
        const index = path.indexOf(s);
        const isActive = index !== -1;
        const shouldRenderLine = index > 0;
        const shouldHighlight =
          highlight != null
            ? index >= highlight.from && index <= highlight.to
            : false;
        const shouldIgnoreHighlightArrow =
          highlight != null ? index === highlight.from : false;

        return (
          <Square key={s} active={isActive} highlight={shouldHighlight}>
            {shouldRenderLine && (
              <Line
                {...getGap(path[index - 1], path[index])}
                ignore={shouldIgnoreHighlightArrow}
              />
            )}
            {value}
          </Square>
        );
      })}
    </GridWrapper>
  );
};
