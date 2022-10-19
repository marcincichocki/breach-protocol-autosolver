import { Cache, Serializable, uniqueBy } from '@/common';
import { HexCode } from '../common';
import { Daemon } from './daemon';
import { HexCodeSequence } from './hex-code-sequence';
import { memoizedFindOverlap } from './overlap';

// interface will lose its index signature.
export type SequenceJSON = {
  value: HexCode[];
  parts: number[];
};

export class Sequence extends HexCodeSequence implements Serializable {
  @Cache()
  get indexes() {
    return this.parts.map((d) => d.index);
  }

  @Cache()
  get parts() {
    return this.permutation
      .flatMap((d) => d.getParts())
      .filter(uniqueBy('index'));
  }

  /** List of indexes on which it is safe to break sequence. */
  @Cache()
  get breaks() {
    // Sequence break is an index which doesn't have daemon attached.
    // For example daemons: FF 7A and BD BD can create sequence FF 7A BD BD.
    // At index 0 and 2 next daemon is not yet started and can be delayed if
    // buffer allows it.
    // It's not possible to break sequence on overlap. For example daemons:
    // FF 7A and 7A BD BD can not be broken on index 2 because they share
    // beginning and the end.
    return this.permutation
      .map((d) => {
        const start = this.tValue.indexOf(d.tValue);
        const end = start + d.length - 1;

        return { start, end };
      })
      .filter(({ start }, i, array) => {
        const { end = -1 } = array[i - 1] ?? {};

        return start > end;
      })
      .map(({ start }) => start);
  }

  constructor(
    value: HexCode[] | string,
    private readonly permutation: Daemon[]
  ) {
    super(value);
  }

  /** Creates sequence out of permutation of daemons up to given length. */
  static fromPermutation(
    permutation: Daemon[],
    max: number = Number.POSITIVE_INFINITY
  ): Sequence {
    let { tValue } = permutation[0];

    for (let i = 1; i < permutation.length; i++) {
      tValue = memoizedFindOverlap(tValue, permutation[i].tValue);

      if (tValue.length > max) {
        return null;
      }
    }

    return new Sequence(tValue, permutation);
  }

  toJSON(): SequenceJSON {
    return {
      value: this.value,
      parts: this.indexes,
    };
  }
}
