import { getClosest, uniqueBy } from '@/common';
import * as daemons from './daemons';
import {
  BreachProtocolBufferSizeFragmentResult,
  BreachProtocolDaemonsFragmentResult,
  BreachProtocolFragmentResult,
  BreachProtocolGridFragmentResult,
  BreachProtocolTypesFragmentResult,
  FragmentId,
} from './ocr';
import { Daemon, Sequence } from './sequence';

export const BUFFER_SIZE_MIN = 4;
export const BUFFER_SIZE_MAX = 9;

export const HEX_CODES = ['E9', '1C', 'BD', '55', '7A', 'FF'] as const;
export type HexCode = typeof HEX_CODES[number];

export type DaemonId = keyof typeof daemons;

export type BufferSize = 4 | 5 | 6 | 7 | 8 | 9;
export type GridRawData = HexCode[];
export type DaemonRawData = HexCode[];
export type DaemonsRawData = DaemonRawData[];
export type TypesRawData = DaemonId[];

const codesIterable = HEX_CODES.map(
  (x, i) => [x, String.fromCharCode(i + 97)] as const
);
const regularHexMap = new Map(codesIterable);
const inverseHexMap = new Map(codesIterable.map(([c, s]) => [s, c]));

export function toHex(value: string) {
  return inverseHexMap.get(value);
}

export function fromHex(key: HexCode) {
  return regularHexMap.get(key);
}

export const ROWS: string = 'ABCDEFGHI';
export const COLS: string = '123456789';

/**
 * Combine elements from two strings together.
 *
 * @param a First string to combine.
 * @param b Second string to comine.
 */
export function cross(a: string, b: string) {
  return Array.from(a).flatMap((r) => Array.from(b).map((c) => r + c));
}

/**
 * Returns array with units for rows and cols.
 *
 * @param rows String with row symbols.
 * @param cols String with col symbols.
 */
export function getUnits(rows: string, cols: string) {
  const rowUnits = Array.from(rows).map((row) => cross(row, cols));
  const colUnits = Array.from(cols).map((col) => cross(rows, col));

  return rowUnits.concat(colUnits);
}

/**
 * Returns Map with each square as key and callback result as value.
 *
 * @param squares List of squares to generate map for.
 * @param cb Callback to execute for each square.
 */
export function generateSquareMap<T>(
  squares: string[],
  cb: (square?: string, index?: number) => T
) {
  return new Map<string, T>(squares.map((s, i) => [s, cb(s, i)]));
}

/**
 * Filter list of {@link Sequence} by buffer length.
 *
 * ```ts
 * [1, 2, 3]
 *   .map(x => new Sequence(x));
 *   .filter(byBufferSize(4))
 * ```
 *
 * @param bufferSize Length of buffer.
 */
export function byBufferSize(bufferSize: BufferSize) {
  return (s: Sequence) => s.value.length <= bufferSize;
}

/**
 * Get unique list of {@link Sequence} or {@link Daemon} by their value.
 */
export function byUniqueValue() {
  return uniqueBy<Sequence | Daemon>('tValue');
}

export interface BreachProtocolRawData {
  [FragmentId.Grid]: GridRawData;
  [FragmentId.Daemons]: DaemonsRawData;
  [FragmentId.Types]?: TypesRawData;
  [FragmentId.BufferSize]: BufferSize;
}

export type BreachProtocolExitStrategy = {
  willExit: boolean;
  shouldForceClose: boolean;
};

function isFragment<T extends BreachProtocolFragmentResult<any>>(
  id: FragmentId
) {
  return (f: BreachProtocolFragmentResult<any>): f is T => f.id === id;
}

export const isGridFragment = isFragment<BreachProtocolGridFragmentResult>(
  FragmentId.Grid
);
export const isBufferSizeFragment =
  isFragment<BreachProtocolBufferSizeFragmentResult>(FragmentId.BufferSize);
export const isDaemonsFragment =
  isFragment<BreachProtocolDaemonsFragmentResult>(FragmentId.Daemons);
export const isTypesFragment = isFragment<BreachProtocolTypesFragmentResult>(
  FragmentId.Types
);

function getDir(orientation: GapOrientation, offset: number): GapDirection {
  switch (orientation) {
    case 'horizontal':
      return offset < 0 ? 'left' : 'right';
    case 'vertical':
      return offset < 0 ? 'top' : 'bottom';
  }
}

export type GapOrientation = 'horizontal' | 'vertical';
export type GapDirection = 'top' | 'right' | 'bottom' | 'left';

export interface Gap {
  offset: number;
  orientation: GapOrientation;
  dir: GapDirection;
}

function processTargets(from: string, to: string, size?: number) {
  const [sr, sc] = from;
  const [er, ec] = to;
  const isHorizontal = sr === er;
  const orientation: GapOrientation = isHorizontal ? 'horizontal' : 'vertical';
  const parts = (isHorizontal ? COLS : ROWS).slice(0, size).split('');
  const ia = parts.indexOf(isHorizontal ? sc : sr);
  const ib = parts.indexOf(isHorizontal ? ec : er);

  return { ia, ib, orientation, parts };
}

/**
 * Returns shortest gap between two squares in a unit. Works
 * with wrap and empty(used) squares.
 *
 * @param from Start square.
 * @param to End square.
 * @param size Length of a unit.
 * @param empty List of rows or columns that are empty.
 */
export function getShortestGap(
  from: string,
  to: string,
  size: number,
  empty: string[] = []
): Gap {
  if (from === to) return null;

  const { ia, ib, parts, orientation } = processTargets(from, to, size);
  const min = Math.min(ia, ib);
  const max = Math.max(ia, ib);
  const { length: regular } = parts.filter(
    (p, i) => i > min && i < max && !empty.includes(p)
  );
  const { length: inverse } = parts.filter(
    (p, i) => (i < min || i > max) && !empty.includes(p)
  );
  const regularOffset = (regular + 1) * Math.sign(ib - ia);
  const inverseOffset = (inverse + 1) * Math.sign(ia - ib);
  const offset = getClosest(0, [regularOffset, inverseOffset]);
  const dir = getDir(orientation, offset);

  return { offset, orientation, dir };
}

export function getRegularGap(from: string, to: string): Gap {
  if (from === to) return null;

  const { ia, ib, orientation } = processTargets(from, to);
  const offset = ib - ia;
  const dir = getDir(orientation, offset);

  return { offset, orientation, dir };
}
