import { t, unique } from '@/common';
import { Sequence } from './sequence';

export const HEX_NUMBERS = ['E9', '1C', 'BD', '55', '7A', 'FF'];
export const BUFFER_SIZE_MIN = 4;
export const BUFFER_SIZE_MAX = 8;

const values = HEX_NUMBERS.map((x, i) => String.fromCharCode(i + 97));
const HEX_MAP = new Map(HEX_NUMBERS.map((k, i) => [k, values[i]]));

export type BufferSize = 4 | 5 | 6 | 7 | 8;

export function toHex(value: string) {
  for (let [k, v] of HEX_MAP.entries()) {
    if (v === value) return k;
  }
}

export function fromHex(key: string) {
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

export interface BreachProtocolRawData {
  grid: string[];
  daemons: string[][];
  bufferSize: BufferSize;
}

export interface BreachProtocolData extends BreachProtocolRawData {
  tGrid: string[];
  tDaemons: string[];
}

export function transformRawData({
  grid,
  daemons,
  bufferSize,
}: BreachProtocolRawData): BreachProtocolData {
  const tGrid = grid.map(fromHex);
  const tDaemons = daemons.map((d) => d.map(fromHex).join(''));

  return {
    tGrid,
    tDaemons,
    grid,
    daemons,
    bufferSize,
  };
}

function validateSymbols(symbols: string[]) {
  if (!symbols.length) {
    // [].every(() => {}) returns true
    return false;
  }

  return symbols.filter(unique).every((s) => HEX_NUMBERS.includes(s));
}

function validateBufferSize(n: number) {
  return Number.isInteger(n) && n >= BUFFER_SIZE_MIN && n <= BUFFER_SIZE_MAX;
}

function isSquare(n: number) {
  return n > 0 && Math.sqrt(n) % 1 === 0;
}

export function validateRawData({
  grid,
  daemons,
  bufferSize,
}: BreachProtocolRawData) {
  const isGridValid = validateSymbols(grid) && isSquare(grid.length);
  const areDaemonsValid = validateSymbols(daemons.flat());
  const isBufferValid = validateBufferSize(bufferSize);

  if (!isGridValid || !areDaemonsValid || !isBufferValid) {
    throw new Error(t`OCR_DATA_INVALID`);
  }
}
