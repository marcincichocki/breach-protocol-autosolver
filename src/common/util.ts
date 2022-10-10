export function capitalize<T extends string>(value: T) {
  return (value[0].toUpperCase() + value.slice(1)) as Capitalize<T>;
}

export function isJSONObject(data: unknown): data is object {
  return typeof data === 'object' && data !== null;
}

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

export type JSONValue =
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
    return (this.mask & flag) === flag;
  }

  add(flag: number) {
    this.mask |= flag;

    return this;
  }

  delete(flag: number) {
    this.mask = this.mask & ~flag;

    return this;
  }
}

/** Wait for given amount of milliseconds. */
export function sleep(delay: number) {
  return delay ? new Promise((r) => setTimeout(r, delay)) : Promise.resolve();
}

/** Does nothing. */
export const noop = () => {};

/** Check how similar are 2 strings using Gestalt Pattern Matching algorithm. */
// https://github.com/ben-yocum/gestalt-pattern-matcher/blob/master/gestalt-pattern-matcher.js
export function similarity(s1: string, s2: string) {
  const stack = [s1, s2];
  let score = 0;

  while (stack.length) {
    const a = stack.pop();
    const b = stack.pop();

    let longestLength = 0;
    let longestIndex1 = -1;
    let longestIndex2 = -1;

    for (let i = 0; i < a.length; i++) {
      for (let j = 0; j < b.length; j++) {
        let k = 0;

        while (
          i + k < a.length &&
          j + k < b.length &&
          a.charAt(i + k) === b.charAt(j + k)
        ) {
          k++;
        }

        if (k > longestLength) {
          longestLength = k;
          longestIndex1 = i;
          longestIndex2 = j;
        }
      }
    }

    if (longestLength) {
      score += longestLength * 2;

      if (longestIndex1 !== 0 && longestIndex2 !== 0) {
        stack.push(a.substring(0, longestIndex1));
        stack.push(b.substring(0, longestIndex2));
      }

      if (
        longestIndex1 + longestLength !== a.length &&
        longestIndex2 + longestLength !== b.length
      ) {
        stack.push(a.substring(longestIndex1 + longestLength, a.length));
        stack.push(b.substring(longestIndex2 + longestLength, b.length));
      }
    }
  }

  return score / (s1.length + s2.length);
}

const jpegRe = /^jpe?g$/;

export function toBase64DataUri(format: string, base64: string) {
  const mime = `image/${jpegRe.test(format) ? 'jpeg' : 'png'}`;

  return `data:${mime};base64,${base64}`;
}
