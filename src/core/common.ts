import { uniqueBy } from '@/common';
import { BreachProtocolResult } from './game';
import { Daemon, memoizedFindOverlap, Sequence } from './sequence';

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

export interface BreachProtocolExitStrategy {
  willExit: boolean;
  shouldForceClose: boolean;
}

// TODO: allow raw data to be accessed from result
export function resolveExitStrategy(
  result: BreachProtocolResult,
  data: BreachProtocolRawData
): BreachProtocolExitStrategy {
  const { path, sequence } = result;
  // Destructuring method would break context.
  const { tValue: base } = result.getResolvedSequence();

  // BP will exit automatically when all of the buffer has been used.
  const willExit = path.length === data.bufferSize;

  // Get daemons that were not used in resolved sequence.
  // There is no point of finding shorthest daemon,
  // since in very rare cases longer daemon could create
  // better sequence than its shorther peers(bigger overlap).
  const shouldForceClose = data.daemons
    .filter((d, i) => !sequence.indexes.includes(i))
    .some((d) => {
      const daemon = d.map(fromHex).join('');
      const r = memoizedFindOverlap(base, daemon);

      // If potential result(which will never happen) will
      // "fit" in a buffer, then exit again(once to stop,
      // second time to exit).
      // Otherwise user will have to exit manually.
      return r.length <= data.bufferSize;
    });

  return {
    willExit,
    shouldForceClose,
  };
}
