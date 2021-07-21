import { getClosest, uniqueBy } from '@/common';
import {
  BreachProtocolBufferSizeFragmentResult,
  BreachProtocolDaemonsFragmentResult,
  BreachProtocolFragmentResult,
  BreachProtocolGridFragmentResult,
  FragmentId,
} from './ocr';
import { Daemon, Sequence } from './sequence';

export const HEX_NUMBERS = ['E9', '1C', 'BD', '55', '7A', 'FF'] as const;
export type HexNumber = typeof HEX_NUMBERS[number];
export const BUFFER_SIZE_MIN = 4;
export const BUFFER_SIZE_MAX = 9;

const values = HEX_NUMBERS.map((x, i) => String.fromCharCode(i + 97));
const HEX_MAP = new Map(HEX_NUMBERS.map((k, i) => [k, values[i]]));

export type BufferSize = 4 | 5 | 6 | 7 | 8 | 9;
export type GridRawData = HexNumber[];
export type DaemonRawData = HexNumber[];
export type DaemonsRawData = DaemonRawData[];

export function toHex(value: string) {
  for (let [k, v] of HEX_MAP.entries()) {
    if (v === value) return k;
  }
}

export function fromHex(key: HexNumber) {
  return HEX_MAP.get(key);
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
  grid: GridRawData;
  daemons: DaemonsRawData;
  bufferSize: BufferSize;
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

export const isGridFragment =
  isFragment<BreachProtocolGridFragmentResult>('grid');
export const isBufferSizeFragment =
  isFragment<BreachProtocolBufferSizeFragmentResult>('bufferSize');
export const isDaemonsFragment =
  isFragment<BreachProtocolDaemonsFragmentResult>('daemons');

export function getOffsetWithWrap(ia: number, ib: number, size: number) {
  return ia > ib ? size - ia + ib : ib - (ia + size);
}

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

function processTargets(from: string, to: string) {
  const [sr, sc] = from;
  const [er, ec] = to;
  const isHorizontal = sr === er;
  const orientation: GapOrientation = isHorizontal ? 'horizontal' : 'vertical';
  const list = isHorizontal ? COLS : ROWS;
  const ia = list.indexOf(isHorizontal ? sc : sr);
  const ib = list.indexOf(isHorizontal ? ec : er);

  return { ia, ib, orientation };
}

// idea: instead of using indexOf to get start and end, use filter
// This will get benefit of getting done squares out faster which will
// in turn further reduce numer of steps required(becase we will compare
// gap without empty nodes instead with). This will require different logic
// to handle regular and inverse gap.
// Additional parameter will be necessary, a list of "moving" parts in unit.
// Given nodes "A1" and "A4", row is a fixed part and col is a moving part.
// List of such moving parts can be then used to determine empty squares,
// that should be ignored when counting squares with filter.
//
// This should have no effect when there is no empty array.
//
// ```ts
// const ia = list.indexOf(from);
// const ib = list.indexOf(to);
// const start = Math.min(from, to);
// const end = Math.max(from, to);
//
// // regular
// const { length: gap } = list.filter((x, i) => i > start && i < end && !empty.includes(x));
//
// // inverse
// const { length: gapInverse } = list.filter((x, i) => i < start && i > end && !empty.includes(x));
// ```
export function processTargetsNew(from: string, to: string, size?: number) {
  const [sr, sc] = from;
  const [er, ec] = to;
  const isHorizontal = sr === er;
  const orientation: GapOrientation = isHorizontal ? 'horizontal' : 'vertical';
  const parts = isHorizontal ? COLS.slice(0, size) : ROWS.slice(0, size);
  const ia = parts.indexOf(isHorizontal ? sc : sr);
  const ib = parts.indexOf(isHorizontal ? ec : er);

  return { ia, ib, orientation, parts: parts.split('') };
}

export function getRegularGap(from: string, to: string) {
  if (from === to) return null;

  const { ia, ib, orientation } = processTargetsNew(from, to);
  const offset = ib - ia;
  const dir = getDir(orientation, offset);

  return { offset, orientation, dir };
}

export function getShortestGapNew(
  from: string,
  to: string,
  size: number,
  empty: string[] = []
) {
  const { ia, ib, parts, orientation } = processTargetsNew(from, to, size);
  const min = Math.min(ia, ib);
  const max = Math.max(ia, ib);
  const sign = Math.sign(ib - ia);
  // prettier-ignore
  const regular = parts.filter((p, i) => i > min && i <= max && !empty.includes(p));
  // prettier-ignore
  const inverse = parts.filter((p, i) => (i < min || i >= max) && !empty.includes(p));
  const offset = getClosest(0, [
    regular.length * sign,
    inverse.length * (sign * -1),
  ]);
  const dir = getDir(orientation, offset);

  return { offset, orientation, dir };
}

export function getShortestGap(from: string, to: string, size: number) {
  if (from === to) return null;

  const { ia, ib, orientation } = processTargets(from, to);
  const regular = ib - ia;
  const inverse = getOffsetWithWrap(ia, ib, size);
  const offset = getClosest(0, [regular, inverse]);
  const dir = getDir(orientation, offset);

  return { orientation, offset, dir };
}

export function getGap(from: string, to: string) {
  if (from === to) return null;

  const { ia, ib, orientation } = processTargets(from, to);
  const offset = ib - ia;
  const dir = getDir(orientation, offset);

  return { offset, orientation, dir };
}

export function getNodes(
  from: string,
  to: string,
  unit: string[],
  offset: number
) {
  const ia = unit.indexOf(from);
  const ib = unit.indexOf(to);
  const sign = Math.sign(offset);
  const inbound = ia + offset + sign < unit.length && ia + offset + sign > 0;

  return inbound
    ? unit.slice(Math.min(ia, ib) + 1, Math.max(ia, ib))
    : unit
        .slice(0, ia < ib ? ia : ib)
        .concat(unit.slice(ia < ib ? ib + 1 : ia + 1));
}
