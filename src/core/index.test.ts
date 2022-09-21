import registry from './bp-registry/registry.json';
import data from './bp-registry/test-data.json';
import {
  BreachProtocolRawData,
  BufferSize,
  cross,
  DaemonRawData,
  DaemonsRawData,
  generateSquareMap,
  getRegularGap,
  getShortestGap,
  getUnits,
  GridRawData,
} from './common';
import {
  BreachProtocol,
  BreachProtocolOptions,
  BreachProtocolResult,
  BreachProtocolStrategy,
} from './game';
import { Daemon, parseDaemons, Sequence } from './sequence';

const registryBreachProtocols = [
  ...registry.custom,
  ...registry['1024x768'],
  ...registry['1920x1080'],
  ...registry['2560x1440'],
  ...registry['3440x1440'],
  ...registry['3840x2160'],
] as BreachProtocolRawData[];

const testData = (data as BreachProtocolRawData[]).concat(
  registryBreachProtocols
);

describe('utilities', () => {
  it('should combine 2 strings', () => {
    const a = 'ab';
    const b = '12';
    const result = cross(a, b);

    expect(result).toEqual(['a1', 'a2', 'b1', 'b2']);
    expect(result.length).toBe(a.length * b.length);
  });

  it('should return array of units in correct order', () => {
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

  it('should generate square map with correct values', () => {
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

  it('should generate correct gap between squares', () => {
    expect(getRegularGap('A1', 'A7')).toEqual({
      offset: 6,
      orientation: 'horizontal',
      dir: 'right',
    });

    expect(getRegularGap('C6', 'C5')).toEqual({
      offset: -1,
      orientation: 'horizontal',
      dir: 'left',
    });

    expect(getRegularGap('A6', 'D6')).toEqual({
      offset: 3,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getRegularGap('G2', 'C2')).toEqual({
      offset: -4,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getRegularGap('A1', 'A1')).toEqual(null);
  });

  it('should find shortest gap', () => {
    expect(getShortestGap('A1', 'E1', 7)).toEqual({
      offset: -3,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('A1', 'A4', 4)).toEqual({
      offset: -1,
      orientation: 'horizontal',
      dir: 'left',
    });

    expect(getShortestGap('C1', 'E1', 7)).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('E1', 'C1', 7)).toEqual({
      offset: -2,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('E1', 'B1', 5)).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('B1', 'E1', 5)).toEqual({
      offset: -2,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('A1', 'A5', 6, ['2', '3', '4'])).toEqual({
      offset: 1,
      orientation: 'horizontal',
      dir: 'right',
    });

    expect(getShortestGap('G1', 'D1', 7, ['A', 'B'])).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('B4', 'B1', 5, ['4'])).toEqual({
      offset: 2,
      orientation: 'horizontal',
      dir: 'right',
    });
  });
});

describe('Breach protocol solve', () => {
  const options: BreachProtocolOptions = { strategy: 'bfs' };

  it('should resolve 3 base cases', () => {
    // prettier-ignore
    const grid: GridRawData = [
      '55', '55', '1C', 
      '55', '1C', 'E9',
      '55', '55', '1C'
    ]
    const bufferSize = 5;
    const g1 = new BreachProtocol({ grid, bufferSize, daemons: [] }, options);
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
    ].map((s: DaemonRawData) =>
      g1.solve([new Sequence(s, [new Daemon(s, 0)])])
    );

    results.forEach((result) => {
      expect(result.path.length).toBeLessThanOrEqual(bufferSize);
      expectResolvedSequenceToContainDaemons(result);
    });
  });

  it.each(['bfs', 'dfs'] as BreachProtocolStrategy[])(
    'should find best sequences and solve BPs from raw data',
    (strategy) => {
      testData.forEach((rawData) => {
        const game = new BreachProtocol(rawData, { strategy });
        const result = game.solve();

        expect(result.path.length).toBeLessThanOrEqual(rawData.bufferSize);
        expectResolvedSequenceToContainDaemons(result);
      });
    }
  );

  it('should slice path if it contains accidental daemons', () => {
    // prettier-ignore
    const grid: GridRawData = [
      'FF', '1C', 'FF', 'FF',
      '1C', '55', 'FF', 'FF',
      '55', 'FF', 'FF', 'FF',
      'FF', 'FF', 'FF', 'FF',
    ]
    const daemons: DaemonsRawData = [
      ['55', '1C'],
      ['1C', '55'],
    ];
    const bufferSize: BufferSize = 7;
    const result = new BreachProtocol(
      { grid, daemons, bufferSize },
      options
    ).solve();

    expect(result.path.length).toBeLessThan(result.rawPath.length);
    expect(result.path).not.toEqual(result.rawPath);
    expectResolvedSequenceToContainDaemons(result);
  });

  describe('forceful exit', () => {
    // prettier-ignore
    const grid: GridRawData = [
      '55', '1C', '1C', 'E9', '55',
      'BD', 'BD', 'BD', '1C', '55',
      '55', '1C', '55', '55', '1C',
      '55', '55', 'BD', 'E9', 'E9',
      '55', '1C', '55', '1C', 'E9',
    ]

    it('should not use force exit when BP exits automatically', () => {
      const bufferSize = 4;
      const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C']];
      const [p1] = parseDaemons(daemons);
      const s1 = Sequence.fromPermutation(p1);
      const result = new BreachProtocol(
        {
          grid,
          bufferSize,
          daemons,
        },
        options
      ).solveForSequence(s1);

      expect(result.exitStrategy).toEqual({
        willExit: true,
        shouldForceClose: false,
      });
    });

    it('should exit when BP is completed', () => {
      const bufferSize = 5;
      const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C']];
      const [p1] = parseDaemons(daemons);
      const s1 = Sequence.fromPermutation(p1);
      const result = new BreachProtocol(
        {
          grid,
          bufferSize,
          daemons,
        },
        options
      ).solveForSequence(s1);

      expect(result.exitStrategy).toEqual({
        willExit: false,
        shouldForceClose: false,
      });
    });

    it('should force exit if leftover damon fit buffer', () => {
      const bufferSize = 5;
      const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C'], ['7A']];
      const [p1] = parseDaemons(daemons);
      const s1 = Sequence.fromPermutation(p1.slice(0, 2));
      const result = new BreachProtocol(
        {
          grid,
          bufferSize,
          daemons,
        },
        options
      ).solveForSequence(s1);

      expect(result.exitStrategy).toEqual({
        willExit: false,
        shouldForceClose: true,
      });
    });

    it('should force exit if leftover daemon overlap with sequence and fit buffer', () => {
      const bufferSize = 5;
      const daemons: DaemonsRawData = [
        ['55', 'BD', 'BD', '1C'],
        ['1C', '7A'],
      ];
      const [p1] = parseDaemons(daemons);
      const s1 = Sequence.fromPermutation(p1.slice(0, 1));
      const result = new BreachProtocol(
        {
          grid,
          bufferSize,
          daemons,
        },
        options
      ).solveForSequence(s1);

      expect(result.exitStrategy).toEqual({
        willExit: false,
        shouldForceClose: true,
      });
    });
  });
});

function expectResolvedSequenceToContainDaemons(result: BreachProtocolResult) {
  result.sequence.parts.forEach((d) => {
    expect(result.resolvedSequence.tValue).toContain(d.tValue);
  });
}
