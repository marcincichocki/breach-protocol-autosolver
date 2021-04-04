import registry from '../bp-registry/registry.json';
// NOTE: paths don't work because tests are excluded
import { unique } from '../common';
import {
  BreachProtocolRawData,
  BufferSize,
  cross,
  generateSquareMap,
  getUnits,
  HexNumber,
  transformRawData,
  validateRawData,
} from './common';
import { BreachProtocol } from './game';
import { Daemon, makeSequences } from './sequence';
import { Sequence, findOverlap } from './sequence';
import data from './test-data.json';

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
  ].map((s) => findOverlap(s[0], s[1]));

  expect(overlaps[0]).toEqual('121345'); // 1)
  expect(overlaps[1]).toEqual('22211'); // 2)
  expect(overlaps[2]).toEqual('22111'); // 3)
  expect(overlaps[3]).toEqual('12345'); // 4)
  expect(overlaps[4]).toEqual('54321'); // 5)
});

describe('OCR data validation', () => {
  // prettier-ignore
  const grid = [
    'BD', 'E9', '1C', '7A',
    'FF', '55', '55', '1C',
    '7A', '7A', 'BD', 'BD',
    '1C', '55', 'E9', 'E9'
  ];
  const daemons = [
    ['BD', 'E9'],
    ['1C', '7A'],
    ['FF', '55'],
  ];
  const bufferSize: BufferSize = 6;

  it('should pass it if data is valid', () => {
    expect(() => validateRawData({ grid, daemons, bufferSize })).not.toThrow();
  });

  it('should throw an error if grid is invalid', () => {
    const base = { daemons, bufferSize };
    const invalidGrids = [
      grid.map((s, i) => (i === 5 ? '57' : s)),
      grid.map((s, i) => (i === 9 ? 'asd' : s)),
      grid.map(() => ' '),
      grid.slice(1),
      [] as string[],
    ];

    invalidGrids.forEach((grid) => {
      expect(() => validateRawData({ ...base, grid })).toThrow();
    });
  });

  it('should throw an error if daemons are invalid', () => {
    const base = { grid, bufferSize };
    const invalidDaemons = [
      daemons.map(() => ['B7']),
      daemons.map(() => ['asd']),
      daemons.map(() => [' ']),
      daemons.map(() => [] as string[]),
    ];

    invalidDaemons.forEach((daemons) => {
      expect(() => validateRawData({ ...base, daemons })).toThrow();
    });
  });

  it('should throw an error if buffer size is invalid', () => {
    const base = { grid, daemons };
    const invalidBufferSizes = [NaN, 3, 9, 2 * Math.PI] as BufferSize[];

    invalidBufferSizes.forEach((bufferSize) => {
      expect(() => validateRawData({ ...base, bufferSize })).toThrow();
    });
  });
});

describe('Breach protocol solve', () => {
  test('should resolve 3 base cases', () => {
    const grid = ['d', 'd', 'b', 'd', 'b', 'a', 'd', 'd', 'b'];
    const bufferSize = 5;
    const g1 = new BreachProtocol(grid, bufferSize);
    const results = [
      // case 1) all symbols are accesible from the start.
      ['55', '55', 'E9'],
      // case 2) one or more symbols are not in chain, but fallback values
      // contain starting value of sequence.
      ['55', 'E9', '1C'],
      // case 3) no starting value at all in one or more units. Sequence
      // will start from the start every time that happens until we run
      // out of buffer.
      ['E9', '55', '55'],
    ].map((s: HexNumber[]) => g1.solve([new Sequence(s, [new Daemon(s, 0)])]));

    results.forEach((result) => {
      expect(result.path.length).toBeLessThanOrEqual(bufferSize);
      expect(result.getResolvedSequence().tValue).toContain(
        result.sequence.tValue
      );
    });
  });

  it('should find best sequences and solve BPs from raw data', () => {
    transformedData.forEach((d, i) => {
      const game = new BreachProtocol(d.tGrid, d.bufferSize);
      const sequences = makeSequences(d.daemons, d.bufferSize);
      const result = game.solve(sequences);

      expect(result.path.length).toBeLessThanOrEqual(d.bufferSize);
      expect(result.getResolvedSequence().tValue).toContain(
        result.sequence.tValue
      );
    });
  });
});
