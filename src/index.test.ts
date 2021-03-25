import { BreachProtocol } from './game';
import {
  cross,
  getUnits,
  generateSquareMap,
  transformRawData,
  BreachProtocolRawData,
} from './common';
import { findOverlaps, Sequence, produceSequences } from './sequence';

import data from './test-data.json';
import registry from './bp-registry/registry.json';
import { unique } from './util';

const registryBreachProtocols = [
  ...registry['1920x1080'],
  ...registry['2560x1440'],
  ...registry['3840x2160'],
] as BreachProtocolRawData[];

const transformedData = data
  .concat(registryBreachProtocols)
  .map((d) => transformRawData(d as BreachProtocolRawData));

describe('utilities', () => {
  test('should produce unique list', () => {
    expect([1, 2, 1, 1].filter(unique)).toEqual([1, 2]);
    expect(['abc', 'abcd', 'abc'].filter(unique)).toEqual(['abc', 'abcd']);
  });

  test('should combine 2 strings', () => {
    const a = 'ab';
    const b = '12';
    const result = cross(a, b);

    expect(result).toEqual(['a1', 'a2', 'b1', 'b2']);
    expect(result.length).toBe(a.length * b.length);
  });

  test('should return array of units in correct order', () => {
    const result = getUnits('abc', '123');

    expect(result).toEqual([
      ['a1', 'a2', 'a3'],
      ['b1', 'b2', 'b3'],
      ['c1', 'c2', 'c3'],
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
      ['a3', 'b3', 'c3'],
    ]);

    const b2Units = result.filter((u) => u.includes('b2'));

    expect(b2Units).toEqual([
      ['b1', 'b2', 'b3'], // row
      ['a2', 'b2', 'c2'], // col
    ]);
  });

  test('should generate square map with correct values', () => {
    const squares = cross('ab', '12');
    const result = generateSquareMap(squares, (squre, index) => {
      if (squre === 'b2') {
        return 42;
      }

      return index;
    });

    expect(result.get('a1')).toBe(0);
    expect(result.get('a2')).toBe(1);
    expect(result.get('b1')).toBe(2);
    expect(result.get('b2')).toBe(42);
    expect(result.size).toBe(squares.length);
  });
});

test('should create sequences', () => {
  const overlaps = [
    ['121', '345'], // 1) no overlap
    ['222', '2211'], // 2) two overlaps in start dir
    ['2211', '111'], // 3) two overlaps in end dir
    ['123', '345'], // 4) standard same start end
    ['543', '321'], // 5) standard same end start
    ['121', '21412'], // 6) both strings share start and end, sort to ensure predictable order
    ['254', '412'], // 7) another example of both start end
  ]
    .map((s) => <[Sequence, Sequence]>s.map((s2) => new Sequence(s2)))
    .map((s) => findOverlaps(...s).map((s2) => s2.value));

  expect(overlaps[0]).toEqual([]); // 1)
  expect(overlaps[1]).toEqual(['22211']); // 2)
  expect(overlaps[2]).toEqual(['22111']); // 3)
  expect(overlaps[3]).toEqual(['12345']); // 4)
  expect(overlaps[4]).toEqual(['54321']); // 5)
  expect(overlaps[5].sort()).toEqual(['121412', '214121']); // 6
  expect(overlaps[6].sort()).toEqual(['25412', '41254']); // 7)
});

describe('Breach protocol solve', () => {
  test('should resolve 3 base cases', () => {
    const grid = ['d', 'd', 'b', 'd', 'b', 'a', 'd', 'd', 'b'];
    const bufferSize = 5;
    const g1 = new BreachProtocol(grid, bufferSize);
    const results = [
      // case 1) all symbols are accesible from the start.
      'dda',
      // case 2) one or more symbols are not in chain, but fallback values
      // contain starting value of sequence.
      'dab',
      // case 3) no starting value at all in one or more units. Sequence
      // will start from the start every time that happens until we run
      // out of buffer.
      'add',
    ].map((s) => g1.solve([new Sequence(s)]));

    results.forEach((result) => {
      expect(result.path.length).toBeLessThanOrEqual(bufferSize);
      expect(result.getResolvedSequence().value).toContain(
        result.sequence.value
      );
    });
  });

  it('should find best sequences and solve BPs from raw data', () => {
    transformedData.forEach((d, i) => {
      const game = new BreachProtocol(d.tGrid, d.bufferSize);
      const sequences = produceSequences(d.tDaemons, d.bufferSize);
      const result = game.solve(sequences);

      expect(result.path.length).toBeLessThanOrEqual(d.bufferSize);
      expect(result.getResolvedSequence().value).toContain(
        result.sequence.value
      );
    });
  });
});
