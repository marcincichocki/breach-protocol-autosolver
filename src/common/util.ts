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

export function swap<T1 = any, T2 = any>([a, b]: readonly [T1, T2]): [
  b: T2,
  a: T1
] {
  return [b, a];
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

export function createLogger(enable = false) {
  return (...args: any[]) => (enable ? console.log.apply(this, args) : null);
}

export function pressAnyKey() {
  return new Promise((r) => {
    process.stdin.resume();
    process.stdin.once('data', r);
  });
}

export function chunk(str: string, size: number) {
  const chunks = [];

  for (let i = 0; i < str.length; i += size) {
    chunks.push(str.slice(i, i + size));
  }

  return chunks;
}

/** Finds greatest common divisor for 2 numbers.*/
export function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}
