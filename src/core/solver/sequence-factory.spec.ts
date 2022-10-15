import { BreachProtocolRawData, DaemonsRawData } from '../common';
import { Sequence } from './sequence';
import entries from '../bp-registry/sequences.json';
import { IndexHierarchyProvider } from './hierarchy/index-hierarchy-provider';
import { SequenceFactory } from './sequence-factory';
import { FocusHierarchyProvider } from './hierarchy/focus-hierarchy-provider';

interface SequenceEntry {
  description: string;
  rawData: BreachProtocolRawData;
  expected: {
    indexes: number[][];
    sequences: DaemonsRawData;
  };
}

describe('Sequence factory', () => {
  describe('Index hierarchy', () => {
    it.each(entries as SequenceEntry[])(
      'should work with $description',
      ({ rawData, expected }) => {
        const provider = new IndexHierarchyProvider();
        const factory = new SequenceFactory(rawData, {
          hierarchy: provider.provide(rawData),
        });

        const sequences = Array.from(factory.getSequences());
        expectSequencesToContainDaemons(sequences, expected.indexes);
        expectSequencesToEqual(sequences, expected.sequences);
      }
    );
  });

  describe('Focus hierarchy', () => {
    it('should return sequences sorted by selected daemon', () => {
      const base = new IndexHierarchyProvider();
      const provider = new FocusHierarchyProvider(0, base);
      const rawData: BreachProtocolRawData = {
        grid: [],
        bufferSize: 5,
        daemons: [
          ['1C', '1C'],
          ['55', '7A', 'BD'],
          ['1C', '7A', '7A'],
        ],
      };
      const factory = new SequenceFactory(rawData, {
        hierarchy: provider.provide(rawData),
      });

      const sequences = Array.from(factory.getSequences());
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
        ['55', '7A', 'BD', '1C', '1C'],
        ['1C', '1C', '55', '7A', 'BD'],
        ['1C', '1C'],
        ['1C', '7A', '7A'],
        ['55', '7A', 'BD'],
      ]);
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
