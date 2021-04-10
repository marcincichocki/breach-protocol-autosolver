import { gcd, t, unique, uniqueBy } from '@/common';
import { BreachProtocolResult } from './game';
import { Daemon, Sequence } from './sequence';

export const WINDOW_TITLES: ReadonlyArray<string> = [
  'Cyberpunk 2077 (C) 2020 by CD Projekt RED',
  'Cyberpunk 2077® on GeForce NOW',
];

export const HEX_NUMBERS = ['E9', '1C', 'BD', '55', '7A', 'FF'] as const;
export type HexNumber = typeof HEX_NUMBERS[number];
export const BUFFER_SIZE_MIN = 4;
export const BUFFER_SIZE_MAX = 9;

const values = HEX_NUMBERS.map((x, i) => String.fromCharCode(i + 97));
const HEX_MAP = new Map(HEX_NUMBERS.map((k, i) => [k, values[i]]));

export type BufferSize = 4 | 5 | 6 | 7 | 8 | 9;

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
  grid: HexNumber[];
  daemons: HexNumber[][];
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

export class BreachProtocolValidationError extends Error {
  readonly name = this.constructor.name;

  constructor(
    public message: string,
    public readonly data: BreachProtocolRawData
  ) {
    super(message);
  }
}

function validateSymbols(symbols: string[]) {
  if (!symbols.length) {
    // [].every(() => {}) returns true
    return false;
  }

  return symbols
    .filter(unique)
    .every((s) => HEX_NUMBERS.includes(s as HexNumber));
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
    throw new BreachProtocolValidationError(t`OCR_DATA_INVALID`, {
      grid,
      daemons,
      bufferSize,
    });
  }
}

export interface BreachProtocolExitStrategy {
  willExit: boolean;
  shouldForceClose: boolean;
}

// TODO: allow raw data to be accessed from result
export function resolveExitStrategy(
  result: BreachProtocolResult,
  data: BreachProtocolRawData
): BreachProtocolExitStrategy {
  const willExit = result.path.length === data.bufferSize;
  const size = data.daemons
    .filter((d, i) => !result.sequence.indexes.includes(i))
    .map((d) => d.length)
    .reduce((a, b) => a + b, 0);
  const shouldForceClose = size
    ? result.path.length + size <= data.bufferSize
    : false;

  return {
    willExit,
    shouldForceClose,
  };
}

export const BREACH_PROTOCOL_ASPECT_RATIO = 16 / 9;

export function isCorrectAspectRatio(x: number, y: number) {
  // WXGA, very close to 16:9
  // TODO: test if this resolution correctly ocr buffer size.
  // https://en.wikipedia.org/wiki/Graphics_display_resolution#WXGA
  if (y === 768) {
    if (x === 1366 || x === 1360) {
      return true;
    }
  }

  const d = gcd(x, y);
  const dx = x / d;
  const dy = y / d;
  const aspectRatio = dx / dy;

  return aspectRatio === BREACH_PROTOCOL_ASPECT_RATIO;
}
