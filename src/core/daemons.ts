import { permute, unique } from '@/common';
import { BufferSize, fromHex, HexNumber, toHex } from './common';

// Simple memo, only use with primitives
function memoize<R, T extends (...args: any[]) => R>(fn: T): T {
  const cache = new Map<string, R>();

  return ((...args: any[]) => {
    const key = args.join('');

    if (!cache.has(key)) {
      cache.set(key, fn.apply(this, args));
    }

    return cache.get(key);
  }) as T;
}

// Deamon must be immutable
// since we pass it around in array
// copying its reference etc
// SHOULD DAEMON SAVE FULL OVERLAP CHILDREN??
export class Daemon {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  constructor(
    public readonly value: HexNumber[],
    public readonly index: number,
    public children?: Daemon[],
    id?: string
  ) {}
}

const findOverlap = memoize((s1: string, s2: string) => {
  const l = s1.length;
  let i = Math.min(s1.length, s2.length);

  while (--i) {
    const a = s1.substring(l - i, l);
    const b = s2.substring(0, i);

    if (a === b) {
      return s1 + s2.substring(i);
    }
  }

  return s1 + s2;
});

export function sequenceFrom(permutation: Daemon[]) {
  let { tValue } = permutation[0];

  for (let i = 1; i < permutation.length; i++) {
    tValue = findOverlap(tValue, permutation[i].tValue);
  }

  const value = tValue.split('').map(toHex);

  // this will fail? when called with single argument.
  // const value = permutation
  //   .map((d) => d.tValue)
  //   .reduce((prev, curr) => findOverlap(prev, curr))
  //   .split('')
  //   .map(toHex);
  const parts = permutation.flatMap((d) =>
    d.children ? d.children.concat(d) : d
  );

  return new Sequence2(value, parts);
}

export class Sequence2 {
  tValue = this.value.map(fromHex).join('');

  length = this.value.length;

  indexes = this.parts.map((d) => d.index);

  strength = this.parts.map((d) => d.index + 1).reduce((a, b) => a + b, 0);

  constructor(public value: HexNumber[], public parts: Daemon[]) {}
}

function getPermutationId(p: Daemon[]) {
  return p.map((d) => d.tValue).join();
}

export function makeSequences(daemons: string[][], bufferSize: BufferSize) {
  const baseDaemons = daemons.map((d, i) => new Daemon(d as HexNumber[], i));
  const basePermutations = permute(baseDaemons).flatMap((p) => {
    return p.map((d, i) => p.slice(0, i + 1));
  });
  const permutationsIds = basePermutations.map(getPermutationId);
  const permutations = basePermutations.filter((p, i) => {
    return unique(getPermutationId(p), i, permutationsIds);
  });

  return permutations
    .map(sequenceFrom)
    .filter((s) => s.length <= bufferSize)
    .sort((s1, s2) => {
      const byStrength = s2.strength - s1.strength;
      const byLength = s1.value.length - s2.value.length;

      return byStrength || byLength;
    });
}
