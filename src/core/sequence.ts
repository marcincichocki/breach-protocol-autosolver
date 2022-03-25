import {
  groupBy,
  memoize,
  permute,
  Serializable,
  uniqueBy,
  uniqueWith,
} from '@/common';
import {
  BreachProtocolRawData,
  byBufferSize,
  byUniqueValue,
  DaemonRawData,
  DaemonsRawData,
  fromHex,
  HexCode,
  toHex,
} from './common';
import {
  IndexSequenceCompareStrategy,
  SequenceCompareStrategy,
} from './compare-strategy';

export interface RawSequence {
  value: string[];
  parts: string[][];
}

export class Daemon {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  get isChild() {
    return !!this.parent;
  }

  get isParent() {
    return !!this.children.length;
  }

  private parent: Daemon = null;

  private children: Daemon[] = [];

  constructor(
    public readonly value: DaemonRawData,
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

export const memoizedFindOverlap = memoize(findOverlap);

// interface will lose its index signature.
export type SequenceJSON = {
  value: HexCode[];
  parts: number[];
};

export class Sequence implements Serializable {
  readonly tValue = this.value.map(fromHex).join('');

  readonly length = this.value.length;

  readonly indexes = this.parts.map((d) => d.index);

  /** List of indexes on which it is safe to break sequence. */
  readonly breaks = this.getSequenceBreaks();

  /** Strength is calculated by index of daemon. */
  readonly strength = this.parts
    .map((d) => 2 * d.index + 1)
    .reduce((a, b) => a + b, 0);

  constructor(public value: HexCode[], public readonly parts: Daemon[]) {}

  toJSON(): SequenceJSON {
    return {
      value: this.value,
      parts: this.parts.map((p) => p.index),
    };
  }

  static fromPermutation(permutation: Daemon[]) {
    let { tValue } = permutation[0];

    for (let i = 1; i < permutation.length; i++) {
      tValue = memoizedFindOverlap(tValue, permutation[i].tValue);
    }

    const value = tValue.split('').map(toHex);
    const parts = permutation
      .flatMap((d) => d.getParts())
      .filter(uniqueBy('index'));

    return new Sequence(value, parts);
  }

  // Sequence break is an index which doesn't have dameon attached.
  // For example daemons: FF 7A and BD BD can create sequence FF 7A BD BD.
  // At index 0 and 2 next daemon is not yet started and can be delayed if
  // buffer allows it.
  // It's not possible to break sequence on overlap. For example daemons:
  // FF 7A and 7A BD BD can not be broken on index 2 because they share
  // beggining and the end.
  private getSequenceBreaks() {
    return this.parts
      .map((d) => {
        const start = this.tValue.indexOf(d.tValue);
        const end = start + d.length - 1;

        return [start, end];
      })
      .filter(([s1], i, array) => {
        const prev = array[i - 1];
        const e2 = prev ? prev[1] : -1;

        return s1 > e2;
      })
      .map(([start]) => start);
  }
}

function getPermutationId(p: Daemon[]) {
  return p.map((d) => d.tValue).join();
}

export function parseDaemons(
  daemons: DaemonsRawData
): [regular: Daemon[], children: Daemon[]] {
  const baseDaemons = daemons.map((d, i) => new Daemon(d, i));

  for (let i = 0; i < baseDaemons.length; i++) {
    const d1 = baseDaemons[i];

    for (let j = 0; j < baseDaemons.length; j++) {
      if (i === j) {
        continue;
      }

      const d2 = baseDaemons[j];

      // Prevent marking child as a parent.
      if (d1.tValue.includes(d2.tValue) && !d1.isChild) {
        d1.addChild(d2);
        d2.setParent(d1);
      }
    }
  }

  // These sequences are created out of daemons that overlap completly.
  const childDaemons = baseDaemons.filter((d) => d.isChild);
  const regularDaemons = baseDaemons.filter((d) => !d.isChild);

  return [regularDaemons, childDaemons];
}

function getBestSequenceFromGroup(group: Sequence[]) {
  const daemonCount = group.map((s) => s.parts.length);
  const maxDaemons = Math.max(...daemonCount);

  return group.filter((s) => s.parts.length === maxDaemons)[0];
}

export function generateSequences(
  { daemons, bufferSize }: Omit<BreachProtocolRawData, 'grid'>,
  strategy: SequenceCompareStrategy = new IndexSequenceCompareStrategy()
) {
  const [regularDaemons, childDaemons] = parseDaemons(daemons);
  const childSequences = childDaemons
    .filter(byUniqueValue())
    .map((d) => Sequence.fromPermutation([d]));
  const regularSequences = permute(regularDaemons)
    .flatMap((p) => p.map((d, i) => p.slice(0, i + 1)))
    .filter(uniqueWith(getPermutationId))
    .map((p) => Sequence.fromPermutation(p));
  const sequences = regularSequences
    .concat(childSequences)
    .filter(byBufferSize(bufferSize));
  const group = groupBy(sequences, (s) => s.tValue);

  return Object.keys(group)
    .map((k) => getBestSequenceFromGroup(group[k]))
    .sort((s1, s2) => strategy.apply(s1, s2));
}
