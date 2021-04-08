import { HexNumber } from './common';
import {
  findOverlap,
  getSequenceFromPermutation,
  makeSequences,
  parseDaemons,
  Sequence,
} from './sequence';

describe('sequences', () => {
  it('should find correct overlaps', () => {
    const overlaps = [
      ['121', '345'], // 1) no overlap
      ['222', '2211'], // 2) two overlaps in start dir
      ['2211', '111'], // 3) two overlaps in end dir
      ['123', '345'], // 4) standard same start end
      ['543', '321'], // 5) standard same end start
    ].map((s) => findOverlap(s[0], s[1]));

    expect(overlaps[0]).toEqual('121345'); // 1)
    expect(overlaps[1]).toEqual('22211'); // 2)
    expect(overlaps[2]).toEqual('22111'); // 3)
    expect(overlaps[3]).toEqual('12345'); // 4)
    expect(overlaps[4]).toEqual('54321'); // 5)
  });

  it('should parse daemons', () => {
    // no relations
    const [d1] = parseDaemons([
      ['1C', '1C'],
      ['55', '7A'],
    ]);

    expect(d1.every((d) => !d.isChild)).toBeTruthy();
    expect(d1.every((d) => !d.isParent)).toBeTruthy();

    const p1 = d1[0].getParts();

    expect(p1.length).toBe(1);
    expect(p1[0]).toEqual(d1[0]);

    // simple relation
    const [d2r, d2c] = parseDaemons([
      ['1C', '55', 'BD'],
      ['55', 'BD'],
    ]);

    expect(d2r[0].isParent).toBeTruthy();
    expect(d2r[0].getParts()[1]).toEqual(d2c[0]);
    expect(d2c[0].isChild).toBeTruthy();

    // extreme example
    const [d3r, d3c] = parseDaemons([
      ['55', '55', '55'],
      ['55'],
      ['BD', 'FF'],
      ['BD', 'FF', '55'],
      ['55', '55'],
    ]);

    expect(d3r.every((d) => d.isParent)).toBeTruthy();

    const p3 = d3r[0].getParts();

    expect(p3[1]).toEqual(d3c[2]);
    expect(p3[2]).toEqual(d3c[0]);
    expect(p3.length).toBe(3);

    expect(d3c.every((d) => d.isChild)).toBeTruthy();
  });

  it('should create correct sequence out of permutation', () => {
    const [p1] = parseDaemons([['BD', '55']]);
    const s1 = getSequenceFromPermutation(p1);

    expect(s1.length).toBe(2);
    expect(s1.value).toEqual(p1[0].value);
    expect(s1.strength).toBe(1);
    expect(s1.tValue).toBe(p1[0].tValue);

    const [p2] = parseDaemons([
      ['BD', 'BD'],
      ['7A', '55'],
    ]);
    const s2 = getSequenceFromPermutation(p2);

    expect(s2.length).toBe(4);
    expect(s2.value).toEqual(p2.flatMap((d) => d.value));
    expect(s2.strength).toBe(4);
    expect(s2.tValue).toBe(p2.map((d) => d.tValue).join(''));

    const [p3] = parseDaemons([
      ['1C', '1C', '1C'],
      ['1C', '1C'],
      ['1C', 'BD'],
    ]);
    const s3 = getSequenceFromPermutation(p3);

    expect(s3.length).toBe(4);
    expect(s3.value).toEqual(['1C', '1C', '1C', 'BD']);
    expect(s3.strength).toBe(9);
  });

  it('should create correct sequences out of raw daemons', () => {
    // No overlaps.
    const s1 = makeSequences([['1C', '1C'], ['55']], 5);

    expectSequencesToContainDaemons(s1, [[0, 1], [0, 1], [1], [0]]);
    expectSequencesToEqual(s1, [
      ['1C', '1C', '55'],
      ['55', '1C', '1C'],
      ['55'],
      ['1C', '1C'],
    ]);

    // Full overlap
    const s2 = makeSequences(
      [
        ['7A', 'BD', 'BD'],
        ['BD', 'BD'],
        ['7A', '7A'],
      ],
      8
    );

    expectSequencesToContainDaemons(s2, [
      [0, 1, 2],
      [0, 1, 2],
      [2],
      [0, 1],
      [1],
    ]);
    expectSequencesToEqual(s2, [
      ['7A', '7A', 'BD', 'BD'],
      ['7A', 'BD', 'BD', '7A', '7A'],
      ['7A', '7A'],
      ['7A', 'BD', 'BD'],
      ['BD', 'BD'],
    ]);

    // Small buffer.
    const s3 = makeSequences(
      [
        ['E9', 'E9', 'BD'],
        ['FF', 'FF'],
      ],
      4
    );

    expectSequencesToContainDaemons(s3, [[1], [0]]);
    expectSequencesToEqual(s3, [
      ['FF', 'FF'],
      ['E9', 'E9', 'BD'],
    ]);

    // No child daemons, but there is overlap
    // between regular daemons.
    const s4 = makeSequences(
      [
        ['1C', '55', '55'],
        ['55', 'FF'],
        ['FF', 'FF'],
      ],
      8
    );

    expectSequencesToContainDaemons(s4, [
      [0, 1, 2],
      [0, 1, 2],
      [0, 1, 2],
      [0, 1, 2],
      [0, 1, 2],
      [0, 1, 2],
      [1, 2],
      [1, 2],
      [0, 2],
      [2],
      [0, 1],
      [0, 1],
      [1],
      [0],
    ]);
    expectSequencesToEqual(s4, [
      ['1C', '55', '55', 'FF', 'FF'],
      ['FF', 'FF', '1C', '55', '55', 'FF'],
      ['55', 'FF', 'FF', '1C', '55', '55'],
      ['55', 'FF', '1C', '55', '55', 'FF', 'FF'],
      ['1C', '55', '55', 'FF', 'FF', '55', 'FF'],
      ['FF', 'FF', '55', 'FF', '1C', '55', '55'],
      ['55', 'FF', 'FF'],
      ['FF', 'FF', '55', 'FF'],
      ['FF', 'FF', '1C', '55', '55'],
      ['FF', 'FF'],
      ['1C', '55', '55', 'FF'],
      ['55', 'FF', '1C', '55', '55'],
      ['55', 'FF'],
      ['1C', '55', '55'],
    ]);

    // Duplicated daemon with no overlap.
    const s5 = makeSequences(
      [
        ['1C', '1C'],
        ['1C', '1C'],
        ['BD', '1C', '55'],
      ],
      7
    );

    expectSequencesToContainDaemons(s5, [[0, 1, 2], [0, 1, 2], [2], [0, 1]]);
    expectSequencesToEqual(s5, [
      ['1C', '1C', 'BD', '1C', '55'],
      ['BD', '1C', '55', '1C', '1C'],
      ['BD', '1C', '55'],
      ['1C', '1C'],
    ]);

    // Multiple overlaps and duplicates.
    const s6 = makeSequences(
      [['1C', '1C'], ['1C'], ['1C', '1C', '1C'], ['1C', '1C']],
      8
    );

    expectSequencesToContainDaemons(s6, [[0, 1, 2, 3], [0, 1, 3], [1]]);
    expectSequencesToEqual(s6, [['1C', '1C', '1C'], ['1C', '1C'], ['1C']]);

    // Duplicate with partial overlap.
    const s7 = makeSequences(
      [
        ['BD', '55', '1C'],
        ['1C', '1C'],
        ['BD', '55', '1C'],
      ],
      7
    );

    expectSequencesToEqual(s7, [
      ['BD', '55', '1C', '1C'],
      ['1C', '1C', 'BD', '55', '1C'],
      ['BD', '55', '1C'],
      ['1C', '1C'],
    ]);
    expectSequencesToContainDaemons(s7, [[0, 1, 2], [0, 1, 2], [0, 2], [1]]);

    // Only duplicate.
    const s8 = makeSequences(
      [
        ['1C', '1C'],
        ['1C', '1C'],
      ],
      7
    );

    expectSequencesToContainDaemons(s8, [[0, 1]]);
    expectSequencesToEqual(s8, [['1C', '1C']]);
  });
});

function expectSequencesToEqual(sequences: Sequence[], values: HexNumber[][]) {
  sequences.forEach((s, i) => expect(s.value).toEqual(values[i]));
}

function expectSequencesToContainDaemons(
  sequences: Sequence[],
  indexes: number[][]
) {
  sequences.forEach((s, i) => expectSequenceToContainDaemons(s, indexes[i]));
}

function expectSequenceToContainDaemons(sequence: Sequence, indexes: number[]) {
  expect(sequence.indexes.sort()).toEqual(indexes.sort());
}