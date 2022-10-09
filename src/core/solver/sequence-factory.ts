import { uniqueBy } from '@/common';
import { CombinationStore } from './combination-store';
import { BreachProtocolRawData, toHex } from '../common';
import { HierarchyProvider } from './hierarchy/hierarchy-provider';
import { Daemon } from './daemon';
import { memoizedFindOverlap } from './overlap';
import { Sequence } from './sequence';

export class SequenceFactory {
  private readonly daemons = this.parse();

  private readonly done = new Set<string>();

  private readonly store = new CombinationStore(
    this.provider.provide(this.rawData)
  );

  constructor(
    private readonly rawData: BreachProtocolRawData,
    private readonly provider: HierarchyProvider<BreachProtocolRawData>
  ) {}

  *getSequence() {
    let { max } = this.store;

    while (max--) {
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

        if (this.done.has(tValue)) {
          continue;
        }

        this.done.add(tValue);

        const value = tValue.split('').map(toHex);
        const parts = permutation
          .flatMap((d) => d.getParts())
          .filter(uniqueBy('index'));

        yield new Sequence(value, parts);
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

  private parse() {
    const daemons = this.rawData.daemons.map((d, i) => new Daemon(d, i));

    for (let i = 0; i < daemons.length; i++) {
      const d1 = daemons[i];

      for (let j = 0; j < daemons.length; j++) {
        if (i === j) {
          continue;
        }

        const d2 = daemons[j];

        // Prevent marking child as a parent.
        if (d1.tValue.includes(d2.tValue) && !d1.isChild) {
          d1.addChild(d2);
          d2.setParent(d1);
        }
      }
    }

    return daemons;
  }
}
