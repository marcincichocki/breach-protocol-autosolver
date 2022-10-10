import { uniqueBy } from '@/common';
import { BreachProtocolRawData, toHex } from '../common';
import { CombinationStore } from './combination-store';
import { Daemon } from './daemon';
import { memoizedFindOverlap } from './overlap';
import { Sequence } from './sequence';

interface SequenceFactoryOptions {
  /** Hierarchy of daemons that will be used to sort sequences. */
  hierarchy: number[];

  /**
   * Determines if sequences are emitted immediately, or wait for their
   * permutation cycle to complete. If that is the case, before emitting they
   * will be sorted from the shortest sequence to the longest.
   */
  immediate?: boolean;
}

/** Creates sequences lazily from raw data, according to given hierarchy. */
export class SequenceFactory {
  private readonly daemons = Daemon.parse(this.rawData.daemons);
  private readonly registry = new Set<string>();
  private readonly store = new CombinationStore(this.options.hierarchy);

  constructor(
    private readonly rawData: BreachProtocolRawData,
    private readonly options: SequenceFactoryOptions
  ) {}

  *getSequences() {
    this.registry.clear();

    let { max } = this.store;

    while (max--) {
      const sequences: Sequence[] = [];
      const combination = this.store.getCombination(max + 1);
      const daemons = combination
        .map((index) => this.daemons[index])
        .filter((d1, _, daemons) => {
          if (d1.isChild) {
            return !daemons.some((d2) => d2.has(d1));
          }

          return true;
        });

      permutations: for (const permutation of this.permutate(daemons)) {
        let { tValue } = permutation[0];

        for (let i = 1; i < permutation.length; i++) {
          tValue = memoizedFindOverlap(tValue, permutation[i].tValue);

          if (tValue.length > this.rawData.bufferSize) {
            continue permutations;
          }
        }

        if (this.registry.has(tValue)) {
          continue;
        }

        this.registry.add(tValue);

        const value = tValue.split('').map(toHex);
        const parts = permutation
          .flatMap((d) => d.getParts())
          .filter(uniqueBy('index'));
        const sequence = new Sequence(value, parts);

        if (this.options.immediate) {
          yield sequence;
        } else {
          sequences.push(sequence);
        }
      }

      if (!this.options.immediate) {
        yield* sequences.sort(this.byLength);
      }
    }
  }

  private *permutate<T>(combination: T[]) {
    const { length } = combination;
    const c = Array.from<number>({ length }).fill(0);
    let i = 1;
    let k;
    let p;

    yield combination.slice();

    while (i < length) {
      if (c[i] < i) {
        k = i % 2 && c[i];
        p = combination[i];
        combination[i] = combination[k];
        combination[k] = p;
        ++c[i];
        i = 1;

        yield combination.slice();
      } else {
        c[i] = 0;
        ++i;
      }
    }
  }

  private readonly byLength = (s1: Sequence, s2: Sequence) =>
    s1.length - s2.length;
}
