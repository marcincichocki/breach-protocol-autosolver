import {
  COLS,
  cross,
  Gap,
  GapDirection,
  GapOrientation,
  getRegularGap,
  GridRawData,
  ROWS,
} from '@/core';
import { useState } from 'react';
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
  cursor: default;
`;

interface SquareProps {
  active: boolean;
  highlight: boolean;
  spotlight: boolean;
  pathIndex: number;
}

function getSquarePathIndex({ active, highlight, pathIndex }: SquareProps) {
  return (
    active &&
    `
      &::after {
        ${!highlight && `content: '${pathIndex + 1}';`}
        position: absolute;
        background: var(--background);
        color: var(--primary);
        bottom: -12px;
        right: -5px;
        padding-left: 3px;
        line-height: 1;
        font-size: 1.4rem;
      }
    `
  );
}

const Square = styled.div<SquareProps>`
  ${(p) =>
    p.highlight &&
    css`
      --border: ${cssVarsHighlight.border}px;
      --size: ${cssVarsHighlight.size}px;
    `}

  ${getSquarePathIndex}

  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ active, highlight, spotlight }) =>
    spotlight
      ? 'var(--primary)'
      : active
      ? highlight
        ? 'var(--background)'
        : 'var(--accent)'
      : 'var(--accent-darker)'};
  width: var(--square);
  height: var(--square);
  font-size: 24px;
  font-weight: 500;
  position: relative;
  z-index: ${({ active, spotlight }) =>
    spotlight ? 'auto' : active ? 'auto' : '-3'};
  background: ${({ highlight }) =>
    highlight ? 'var(--accent)' : 'var(--background)'};
  border: var(--border) solid
    ${({ active, spotlight }) =>
      active ? 'var(--accent)' : spotlight ? 'var(--primary)' : 'transparent'};
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

interface LineProps extends Gap {
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
  path?: string[];
  highlight?: Highlight;
}

export const GridViewer = ({ grid, path, highlight }: GridViewerProps) => {
  const [spotlight, setSpotlight] = useState(null);
  const size = Math.sqrt(grid.length);
  const squares = cross(ROWS.slice(0, size), COLS.slice(0, size));

  return (
    <GridWrapper size={size} onMouseLeave={() => setSpotlight(null)}>
      {squares.map((s, i) => {
        const value = grid[i];
        const index = path ? path.indexOf(s) : 0;
        const isActive = path && index !== -1;
        const shouldRenderLine = index > 0;
        const shouldHighlight =
          highlight != null
            ? index >= highlight.from && index <= highlight.to
            : false;
        const shouldIgnoreHighlightArrow =
          highlight != null ? index === highlight.from : false;

        return (
          <Square
            key={s}
            active={isActive}
            highlight={shouldHighlight}
            spotlight={value === spotlight}
            pathIndex={index}
            onMouseEnter={() => setSpotlight(value)}
          >
            {shouldRenderLine && (
              <Line
                {...getRegularGap(path[index - 1], path[index])}
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
