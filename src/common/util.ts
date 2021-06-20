export function unique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

export function uniqueBy<T>(prop: keyof T) {
  return uniqueWith<T, T[keyof T]>((o) => o[prop]);
}

export function uniqueWith<T, R>(fn: (obj: T) => R) {
  let cache = null as T[keyof T][];

  return (value: T, index: number, array: T[]) => {
    const propValue = fn.call(this, value);

    if (!cache) {
      cache = array.map((x) => fn.call(this, x));
    }

    return unique(propValue, index, cache);
  };
}

// Simple memo, only use with primitives
export function memoize<R, T extends (...args: any[]) => R>(fn: T): T {
  const cache = new Map<string, R>();

  return ((...args: any[]) => {
    const key = args.join();

    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }

    return cache.get(key);
  }) as T;
}

// https://stackoverflow.com/a/37580979/4777077
export function permute<T>(permutation: T[]) {
  const { length } = permutation;
  const result = [permutation.slice()];
  const c = Array.from<number>({ length }).fill(0);
  let i = 1;
  let k;
  let p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

export class Point {
  constructor(public x: number, public y: number) {}
}

export function chunk(str: string, size: number) {
  const chunks = [];

  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }

  return chunks;
}

export function getClosest(n: number, list: number[]) {
  const distances = list.map((x) => Math.abs(n - x));
  const min = Math.min(...distances);
  const index = distances.indexOf(min);

  return list[index];
}

type JSONValue =
  | string
  | number
  | boolean
  | null
  | JSONValue[]
  | { [key: string]: JSONValue };

export interface Serializable {
  toJSON:
    | (() => JSONValue)
    | ((key?: string) => JSONValue)
    | ((index?: number) => JSONValue);
}

export class BitMask {
  constructor(public mask: number) {}

  has(flag: number) {
    return (this.mask & flag) !== 0;
  }

  add(flag: number) {
    this.mask = this.mask | flag;

    return this;
  }

  delete(flag: number) {
    this.mask = this.mask & ~flag;

    return this;
  }
}

/** Whether current mode is development. */
export const isDev = process.env.NODE_ENV === 'development';

/** Whether current mode is production. */
export const isProd = process.env.NODE_ENV === 'production';
