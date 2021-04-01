import { permute, swap, unique } from '@/common';
import { BufferSize, byBufferSize, toHex } from './common';

export interface RawSequence {
  value: string[];
  parts: string[][];
}

export class Sequence {
  constructor(public readonly value: string, public readonly parts?: string[]) {
    if (!this.parts) {
      this.parts = [value];
    }
  }

  valueToHex(value = this.value) {
    return value.split('').map((v) => toHex(v));
  }

  partsToHex() {
    return this.parts.map((p) => this.valueToHex(p));
  }

  toHex() {
    return {
      value: this.valueToHex(),
      parts: this.partsToHex(),
    } as RawSequence;
  }
}

/**
 * Try to overlap start of {@param s1} with end of {@param s2} and return
 * combined string.
 *
 * @param s1
 * @param s2
 */
function findEdgeOverlap(s1: string, s2: string) {
  const l = s2.length;
  let i = Math.min(s1.length, s2.length);

  while (--i) {
    const a = s1.substring(0, i);
    const b = s2.substring(l - i, l);

    if (a === b) {
      return s2 + s1.substring(i);
    }
  }

  return null;
}

export function findOverlaps(s1: Sequence, s2: Sequence) {
  const values = [s1.value, s2.value] as const;

  return [values, swap(values)]
    .map((c) => findEdgeOverlap(...c))
    .filter(Boolean)
    .map((o) => new Sequence(o, s1.parts.concat(s2.parts).filter(unique)));
}

export function findAllOverlaps(sequences: Sequence[]): Sequence[] {
  return sequences
    .flatMap((s1, i, a) => a.slice(i + 1).map((s2) => [s1, s2]))
    .flatMap((combination: [Sequence, Sequence]) => {
      // Partial sequences are sequences with at least 2 parts. They may
      // be used if buffer doesn't allow better sequence. They are typically
      // substrings of better sequences, but not every time. There may be case
      // in which partial sequence is the best(no new overlap generated).
      const partials = combination.filter((c) => c.parts.length > 1);
      const overlaps = findOverlaps(...combination);

      // If there are no new overlaps generated, return partials.
      if (!overlaps.length) {
        return partials;
      }

      // Filter sequences to get those which are not used in combinaiton.
      const values = combination.map((c) => c.value);
      const left = sequences.filter((s) => !values.includes(s.value));

      // If there are no spare sequences left, return all overlaps we generated and all partials.
      if (!left.length) {
        return overlaps.concat(partials);
      }

      // If there are overlaps and there are still sequences left to mix, use recursion.
      return overlaps
        .flatMap((o) => findAllOverlaps([o, ...left]))
        .concat(partials);
    })
    .filter((s, i, a) => {
      const values = a.map((v) => v.value);

      return unique(s.value, i, values);
    });
}

export function normalizeDaemons(daemons: string[]): Sequence[] {
  return (
    daemons
      // discarding same daemons can cause problem when selecting best sequence
      // because it will cut length of parts of sequence for each repeated daemon.
      // Not filtering might cause problems with merging sequences when we concat
      // parts and remove repetitions.
      .filter(unique)
      .map((d, i, a) => {
        const parts = a.filter((d2, i2) => d.includes(d2) && i !== i2);

        return new Sequence(d, parts.concat(d));
      })
      .filter((s, i, a) => {
        return !a.some((s2, i2) => {
          const isIndexSame = i === i2;
          const isValueSame = s2.value.includes(s.value);

          return !isIndexSame && isValueSame;
        });
      })
  );
}

// NOTE: check if we need more fallback sequences.
// case: no overlap, only permutations are created,
// but there is no solutions for them in grid.
// In that case we should fallback to permutations of n-1
// until n=1.
export function getFallbackSequences(
  sequences: Sequence[],
  bufferSize: BufferSize
) {
  let r = [];
  let l = sequences.length;

  while (l--) {
    const { value } = sequences[l];
    bufferSize -= value.length;

    if (bufferSize >= 0) {
      r.push(value);
    } else {
      break;
    }
  }

  return permute(r).map((s) => new Sequence(s.join(''), s));
}

export function produceSequences(daemons: string[], bufferSize: BufferSize) {
  const baseSequences = normalizeDaemons(daemons);
  const allOverlaps = findAllOverlaps(baseSequences);

  return allOverlaps
    .filter(byBufferSize(bufferSize))
    .flatMap((o) => {
      let bufferLeft = bufferSize - o.value.length;

      if (!bufferLeft) return o;

      const leftoversThatFitBuffer = baseSequences
        .map((s) => s.value)
        .filter((v) => !o.parts.includes(v))
        // reduceRight because daemons are sorted ascending(from worst to best)
        .reduceRight((prev, curr) => {
          bufferLeft -= curr.length;

          if (bufferLeft >= 0) {
            prev.push(curr);
          }

          return prev;
        }, [] as string[]);

      // if we can't add anything(buffer limit) or there are no overlaps(?) return sequence
      if (!leftoversThatFitBuffer.length) return o;

      return permute(leftoversThatFitBuffer.concat(o.value)).map(
        (c) => new Sequence(c.join(''), o.parts.concat(leftoversThatFitBuffer))
      );
    })
    .sort((s1, s2) => {
      // Sort sequences by which ever have most parts, and than
      // by shorthest value.

      // NOTE: potential problem when sequences have equal ammount of parts, but some have higher priority(?)
      // for example indexes 0,1 are typically worse than 1,2.
      const byParts = s2.parts.length - s1.parts.length;
      const byLength = s1.value.length - s2.value.length;

      return byParts || byLength;
    })
    .concat(getFallbackSequences(baseSequences, bufferSize));
}
