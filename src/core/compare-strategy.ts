import { Sequence } from './sequence';

export abstract class SequenceCompareStrategy {
  protected byStrength(s1: Sequence, s2: Sequence) {
    return s2.strength - s1.strength;
  }

  protected byLength(s1: Sequence, s2: Sequence) {
    return s1.length - s2.length;
  }

  protected byIndex(s1: Sequence, s2: Sequence) {
    return this.byStrength(s1, s2) || this.byLength(s1, s2);
  }

  /** Compare function for sequences. */
  abstract apply(s1: Sequence, s2: Sequence): number;
}

/**
 * Default compare strategy, higher index is better.
 *
 * Indexes are counted from the top to bottom, without daemon solved by
 * "Head Start" perk.
 *
 * Example #1:
 *
 * ```text
 *   1C 1C       <- index: 0
 *   BD BD 1C    <- index: 1
 *   FF BD BD    <- index: 2
 * ```
 *
 * Example #2:
 *
 * ```text
 * ~~BD BD~~     <- index: none, alredy solved by "Head Start" perk
 *   7A 7A BD    <- index: 0
 *   BD 7A 1C    <- index: 1
 *   BD BD       <- index: 2
 *   1C 1C       <- index: 3
 * ```
 *
 * */
export class IndexSequenceCompareStrategy extends SequenceCompareStrategy {
  apply(s1: Sequence, s2: Sequence) {
    return this.byIndex(s1, s2);
  }
}

/**
 * Strategy which focuses on a daemon with given index.
 * If it does not exist in a sequence, index strategy is used as a fallback.
 */
export class FocusedSequenceCompareStrategy extends SequenceCompareStrategy {
  constructor(private readonly focusedDaemonIndex: number) {
    super();
  }

  private hasFocusedDaemon(s: Sequence) {
    return s.indexes.includes(this.focusedDaemonIndex);
  }

  private byFocus(s1: Sequence, s2: Sequence) {
    const a = this.hasFocusedDaemon(s1);
    const b = this.hasFocusedDaemon(s2);

    return a === b ? 0 : a ? -1 : 1;
  }

  apply(s1: Sequence, s2: Sequence) {
    return this.byFocus(s1, s2) || this.byIndex(s1, s2);
  }
}
