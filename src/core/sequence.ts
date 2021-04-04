import { permute, uniqueBy, uniqueWith } from '@/common';
import { BufferSize, fromHex, HexNumber, toHex } from './common';

export interface RawSequence {
  value: string[];
  parts: string[][];
}

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

export class Daemon {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  get isChild() {
    return !!this.parent;
  }

  private parent: Daemon = null;

  private children: Daemon[] = [];

  constructor(
    public readonly value: HexNumber[],
    public readonly index: number,
    id?: string
  ) {}

  addChild(child: Daemon) {
    this.children = [child, ...this.children];
  }

  setParent(parent: Daemon) {
    this.parent = parent;
  }

  getParts() {
    return this.children.length ? [this, ...this.children] : [this];
  }
}

export function findOverlap(s1: string, s2: string) {
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
}

export function sequenceFrom(permutation: Daemon[]) {
  let { tValue } = permutation[0];

  for (let i = 1; i < permutation.length; i++) {
    tValue = findOverlap(tValue, permutation[i].tValue);
  }

  const value = tValue.split('').map(toHex);
  const parts = permutation.flatMap((d) => d.getParts());

  return new Sequence(value, parts);
}

export class Sequence {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  readonly indexes = this.parts.map((d) => d.index);

  readonly strength = this.parts
    .map((d) => d.index + 1)
    .reduce((a, b) => a + b, 0);

  constructor(public value: HexNumber[], public readonly parts: Daemon[]) {}
}

function getPermutationId(p: Daemon[]) {
  return p.map((d) => d.tValue).join();
}

function markChildDaemons(daemons: Daemon[]) {
  for (let i = 0; i < daemons.length; i++) {
    const d1 = daemons[i];

    for (let j = 0; j < daemons.length; j++) {
      if (i === j) {
        continue;
      }

      const d2 = daemons[j];

      if (d1.tValue.includes(d2.tValue)) {
        d1.addChild(d2);
        d2.setParent(d1);
      }
    }
  }
}

export function makeSequences(daemons: string[][], bufferSize: BufferSize) {
  const baseDaemons = daemons.map((d, i) => new Daemon(d as HexNumber[], i));
  markChildDaemons(baseDaemons);

  // These sequences are created out of daemons that overlap completly.
  const childDaemons = baseDaemons.filter((d) => d.isChild);
  const regularDaemons = baseDaemons.filter((d) => !d.isChild);

  const childSequences = childDaemons
    .filter(uniqueBy('tValue'))
    .map((d) => sequenceFrom([d]));

  const regularSequences = permute(regularDaemons)
    .flatMap((p) => p.map((d, i) => p.slice(0, i + 1)))
    .filter(uniqueWith(getPermutationId))
    .map(sequenceFrom);

  return regularSequences
    .concat(childSequences)
    .filter((s) => s.length <= bufferSize)
    .sort((s1, s2) => {
      const byStrength = s2.strength - s1.strength;
      const byLength = s1.value.length - s2.value.length;

      return byStrength || byLength;
    });
}
