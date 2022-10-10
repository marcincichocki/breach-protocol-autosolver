/** Stores combinations of arbitrary data in a space efficient manner. */
export class CombinationStore {
  private readonly store = this.createStore();

  /** Returns value of combination which includes every element. */
  get max() {
    return Array.from(this.store.keys()).reduce((a, b) => a + b, 0);
  }

  constructor(hierarchy: number[]);
  constructor(size: number);
  constructor(private readonly hierarchyOrSize: number | number[]) {}

  /** Returns indexes of combination for given strength. */
  getCombination(strength: number) {
    if (strength > this.max || strength < 0) {
      throw new Error(`There is no combination of strength ${strength}.`);
    }

    return this.reduceNumberToPowersOfTwo(strength).map((power) =>
      this.store.get(power)
    );
  }

  private createHierarchy() {
    if (typeof this.hierarchyOrSize === 'number') {
      return Array.from({ length: this.hierarchyOrSize }, (_, i) => i);
    }

    return this.hierarchyOrSize;
  }

  private createStore() {
    const entires = this.createHierarchy()
      .map((value, index) => ({ value, index }))
      .sort(({ value: a }, { value: b }) => a - b)
      .map(({ index }, k) => [Math.pow(2, k), index] as const);

    return new Map(entires);
  }

  private reduceNumberToPowersOfTwo(n: number) {
    const powers = [];

    while (n) {
      const power = 1 << (31 - Math.clz32(n));
      powers.unshift(power);
      n -= power;
    }

    return powers;
  }
}
