import entries from './bp-registry/sequences.json';
import { BreachProtocolRawData, DaemonsRawData } from './common';
import { FocusDaemonSequenceCompareStrategy } from './compare-strategy';
import {
  findOverlap,
  generateSequences,
  parseDaemons,
  Sequence,
} from './sequence';

interface SequenceEntry {
  description: string;
  rawData: Omit<BreachProtocolRawData, 'grid'>;
  expected: {
    indexes: number[][];
    sequences: DaemonsRawData;
  };
}

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
    const s1 = Sequence.fromPermutation(p1);

    expect(s1.length).toBe(2);
    expect(s1.value).toEqual(p1[0].value);
    expect(s1.strength).toBe(1);
    expect(s1.tValue).toBe(p1[0].tValue);

    const [p2] = parseDaemons([
      ['BD', 'BD'],
      ['7A', '55'],
    ]);
    const s2 = Sequence.fromPermutation(p2);

    expect(s2.length).toBe(4);
    expect(s2.value).toEqual(p2.flatMap((d) => d.value));
    expect(s2.strength).toBe(4);
    expect(s2.tValue).toBe(p2.map((d) => d.tValue).join(''));

    const [p3] = parseDaemons([
      ['1C', '1C', '1C'],
      ['1C', '1C'],
      ['1C', 'BD'],
    ]);
    const s3 = Sequence.fromPermutation(p3);

    expect(s3.length).toBe(4);
    expect(s3.value).toEqual(['1C', '1C', '1C', 'BD']);
    expect(s3.strength).toBe(9);
  });

  describe('generateSequences', () => {
    describe('index strategy', () => {
      it.each(entries as SequenceEntry[])(
        'should work with $description',
        ({ rawData, expected }) => {
          const sequences = generateSequences(rawData);

          expectSequencesToContainDaemons(sequences, expected.indexes);
          expectSequencesToEqual(sequences, expected.sequences);
        }
      );
    });

    describe('focus daemon strategy', () => {
      it('should return sequences sorted by selected daemon', () => {
        const strategy = new FocusDaemonSequenceCompareStrategy(0);
        const rawData: Omit<BreachProtocolRawData, 'grid'> = {
          bufferSize: 5,
          daemons: [
            ['1C', '1C'],
            ['55', '7A', 'BD'],
            ['1C', '7A', '7A'],
          ],
        };
        const sequences = generateSequences(rawData, strategy);

        expectSequencesToContainDaemons(sequences, [
          [0, 2],
          [0, 2],
          [0, 1],
          [0, 1],
          [0],
          [2],
          [1],
        ]);
        expectSequencesToEqual(sequences, [
          ['1C', '1C', '7A', '7A'],
          ['1C', '7A', '7A', '1C', '1C'],
          ['1C', '1C', '55', '7A', 'BD'],
          ['55', '7A', 'BD', '1C', '1C'],
          ['1C', '1C'],
          ['1C', '7A', '7A'],
          ['55', '7A', 'BD'],
        ]);
      });
    });
  });
});

function expectSequencesToEqual(sequences: Sequence[], values: DaemonsRawData) {
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
