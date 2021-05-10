import { COLS, cross, GridRawData, ROWS } from '@/core/common';
import { FC } from 'react';
import styled, { css } from 'styled-components';
import { Highlight } from './HistoryViewer';

const GridWrapper = styled.div<{ size: number }>`
  --size: 5px;
  --gutter: 16px;
  --square: 40px;
  --border: 1px;

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
  ${({ highlight }) =>
    highlight
      ? `
    --border: 4px;
    --size: 7px;
  `
      : ''}

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

function getArrowBorderFor(d: LineDirection) {
  const o: LineOrientation =
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

function getLineSizeFor(o: LineOrientation) {
  return ({ offset, orientation }: LineProps) => {
    const absOffset = Math.abs(offset);
    const squareSize = `var(--square) * ${absOffset - 1}`;
    const gutterSize = `var(--gutter) * ${absOffset}`;

    return orientation === o
      ? 'var(--border)'
      : `calc(${squareSize} + ${gutterSize} - var(--size))`;
  };
}

const arrowBorders = css`
  border-top: ${getArrowBorderFor('top')};
  border-right: ${getArrowBorderFor('right')};
  border-bottom: ${getArrowBorderFor('bottom')};
  border-left: ${getArrowBorderFor('left')};
`;

type LineDirection = 'top' | 'right' | 'bottom' | 'left';
type LineOrientation = 'horizontal' | 'vertical';

interface LineProps {
  offset: number;
  dir: LineDirection;
  orientation: LineOrientation;
}

const Line = styled.div<LineProps>`
  color: var(--accent);
  pointer-events: none;
  position: absolute;
  background: var(--accent);
  z-index: -1;
  width: ${getLineSizeFor('vertical')};
  height: ${getLineSizeFor('horizontal')};
  ${({ dir }) => dir}: calc(var(--square) + var(--size) - var(--border));

  &::after {
    content: '';
    ${arrowBorders}
    ${getArrowPosition}
  }
`;

function findOffset(a: string, b: string, list: string) {
  const ia = list.indexOf(a);
  const ib = list.indexOf(b);

  return ia < ib ? ib - ia : ib - ia;
}

function getLineProps(from: string, to: string): LineProps {
  const [startRow, startCol] = from;
  const [endRow, endCol] = to;
  const orientation = startRow === endRow ? 'horizontal' : 'vertical';
  const isHorizontal = orientation === 'horizontal';
  const a = isHorizontal ? startCol : startRow;
  const b = isHorizontal ? endCol : endRow;
  const offset = findOffset(a, b, isHorizontal ? COLS : ROWS);
  const dir = isHorizontal
    ? offset < 0
      ? 'left'
      : 'right'
    : orientation === 'vertical'
    ? offset < 0
      ? 'top'
      : 'bottom'
    : null;

  return { dir, offset, orientation };
}

interface GridViewerProps {
  grid: GridRawData;
  path: string[];
  highlight?: Highlight;
}

export const GridViewer: FC<GridViewerProps> = ({ grid, path, highlight }) => {
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

        return (
          <Square key={s} active={isActive} highlight={shouldHighlight}>
            {shouldRenderLine && (
              <Line {...getLineProps(path[index - 1], path[index])} />
            )}
            {value}
          </Square>
        );
      })}
    </GridWrapper>
  );
};
