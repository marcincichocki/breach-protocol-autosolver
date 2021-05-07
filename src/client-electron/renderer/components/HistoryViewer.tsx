import { HistoryEntry } from '@/client-electron/common';
import { BreachProtocolGridFragmentResult } from '@/core';
import { COLS, ROWS, cross } from '@/core/common';
import { FC } from 'react';
import styled, { css } from 'styled-components';

interface HistoryViewerProps {
  entry: HistoryEntry;
}

const Square = styled.div<{ active: boolean }>`
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${(props) => (props.active ? 'var(--accent)' : '#1a2424')};
  width: var(--square);
  height: var(--square);
  font-size: 24px;
  position: relative;
  border: var(--border) solid
    ${({ active }) => (active ? 'var(--accent)' : 'transparent')};
`;

const Grid = styled.div<{ size: number }>`
  --size: 7px;
  --gutter: 20px;
  --square: 50px;
  --border: 1px;

  display: inline-grid;
  grid-gap: var(--gutter);
  padding: var(--gutter);
  background: var(--background);
  border: 1px solid var(--primary);
  grid-template-columns: repeat(${(props) => props.size}, max-content);
`;

type LineDirection = 'top' | 'right' | 'bottom' | 'left';
type LineOrientation = 'horizontal' | 'vertical';

interface LineProps {
  offset: number;
  dir: LineDirection;
  orientation: LineOrientation;
}

function findOffset(a: string, b: string, list: string) {
  const ia = list.indexOf(a);
  const ib = list.indexOf(b);

  return ia < ib ? ib - ia : ib - ia;
}

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
    const borderSize = `var(--border) * ${(absOffset - 1) * 2} - var(--size)`;

    return orientation === o
      ? 'var(--border)'
      : `calc(${squareSize} + ${gutterSize} + ${borderSize})`;
  };
}

const arrowBorders = css`
  border-top: ${getArrowBorderFor('top')};
  border-right: ${getArrowBorderFor('right')};
  border-bottom: ${getArrowBorderFor('bottom')};
  border-left: ${getArrowBorderFor('left')};
`;

function getOpposite({ dir }: LineProps) {
  return {
    top: 'bottom',
    bottom: 'top',
    right: 'left',
    left: 'right',
  }[dir];
}

// issue with border, it depends on how many squares line passes through
// more lines bigger error. Also line should end when it reaches the arrow
const Line = styled.div<LineProps>`
  position: absolute;
  background: var(--accent);
  z-index: 1;
  width: ${getLineSizeFor('vertical')};
  height: ${getLineSizeFor('horizontal')};
  ${getOpposite}: calc(var(--square) + var(--border));

  &::after {
    content: '';
    ${arrowBorders}
    ${getArrowPosition}
  }
`;

interface LinesProps {
  path: string[];
}

export const HistoryViewer: FC<HistoryViewerProps> = ({ entry }) => {
  const isGrid = (f: any): f is BreachProtocolGridFragmentResult =>
    f.id === 'grid';
  const grid = entry.fragments.find(isGrid);

  const size = Math.sqrt(grid.rawData.length);
  const squares = cross(ROWS.slice(0, size), COLS.slice(0, size));
  const { path } = entry.result;

  return (
    <Grid size={size}>
      {squares.map((s, i) => {
        const index = path.indexOf(s);
        const isActive = index !== -1;
        const value = grid.rawData[i];
        const notLast = isActive && index !== path.length - 1;

        if (!isActive || (isActive && index === path.length - 1)) {
          return (
            <Square key={s} active={isActive}>
              {value}
            </Square>
          );
        }

        const from = s;
        const to = path[index + 1];
        const [startRow, startCol] = from;
        const [endRow, endCol] = to;
        const orientation =
          startRow === endRow
            ? 'horizontal'
            : startCol === endCol
            ? 'vertical'
            : null;
        const a = orientation === 'horizontal' ? startCol : startRow;
        const b = orientation === 'horizontal' ? endCol : endRow;
        const offset = findOffset(
          a,
          b,
          orientation === 'horizontal' ? COLS : ROWS
        );
        const dir =
          orientation === 'horizontal'
            ? offset < 0
              ? 'left'
              : 'right'
            : orientation === 'vertical'
            ? offset < 0
              ? 'top'
              : 'bottom'
            : null;

        return (
          <Square active={isActive} key={s}>
            {value}
            {notLast && (
              <Line offset={offset} dir={dir} orientation={orientation} />
            )}
          </Square>
        );
      })}
    </Grid>
  );
};
