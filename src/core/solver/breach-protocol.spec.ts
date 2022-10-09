import registry from '../bp-registry/registry.json';
import data from '../bp-registry/test-data.json';
import {
  BreachProtocolRawData,
  BufferSize,
  DaemonRawData,
  DaemonsRawData,
  GridRawData,
} from '../common';
import {
  BreachProtocol,
  BreachProtocolOptions,
  BreachProtocolResult,
  BreachProtocolStrategy,
} from './breach-protocol';
import { Daemon } from './daemon';
import { IndexHierarchyProvider } from './hierarchy/index-hierarchy-provider';
import { Sequence } from './sequence';

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

describe('Breach protocol solve', () => {
  const hierarchyProvider = new IndexHierarchyProvider();
  const options: BreachProtocolOptions = { strategy: 'bfs', hierarchyProvider };

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
      g1.solveForSequence(new Sequence(s, [new Daemon(s, 0)]))
    );

    results.forEach((result) => {
      expect(result.path.length).toBeLessThanOrEqual(bufferSize);
      expectResolvedSequenceToContainDaemons(result);
    });
  });

  fit.each(['bfs', 'dfs'] as BreachProtocolStrategy[])(
    'should find best sequences and solve BPs from raw data',
    (strategy) => {
      testData.forEach((rawData) => {
        const game = new BreachProtocol(rawData, {
          strategy,
          hierarchyProvider,
        });
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

    // it('should not use force exit when BP exits automatically', () => {
    //   const bufferSize = 4;
    //   const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C']];
    //   const [p1] = parseDaemons(daemons);
    //   const s1 = Sequence.fromPermutation(p1);
    //   const result = new BreachProtocol(
    //     {
    //       grid,
    //       bufferSize,
    //       daemons,
    //     },
    //     options
    //   ).solveForSequence(s1);

    //   expect(result.exitStrategy).toEqual({
    //     willExit: true,
    //     shouldForceClose: false,
    //   });
    // });

    // it('should exit when BP is completed', () => {
    //   const bufferSize = 5;
    //   const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C']];
    //   const [p1] = parseDaemons(daemons);
    //   const s1 = Sequence.fromPermutation(p1);
    //   const result = new BreachProtocol(
    //     {
    //       grid,
    //       bufferSize,
    //       daemons,
    //     },
    //     options
    //   ).solveForSequence(s1);

    //   expect(result.exitStrategy).toEqual({
    //     willExit: false,
    //     shouldForceClose: false,
    //   });
    // });

    // it('should force exit if leftover damon fit buffer', () => {
    //   const bufferSize = 5;
    //   const daemons: DaemonsRawData = [['55', 'BD', 'BD'], ['1C'], ['7A']];
    //   const [p1] = parseDaemons(daemons);
    //   const s1 = Sequence.fromPermutation(p1.slice(0, 2));
    //   const result = new BreachProtocol(
    //     {
    //       grid,
    //       bufferSize,
    //       daemons,
    //     },
    //     options
    //   ).solveForSequence(s1);

    //   expect(result.exitStrategy).toEqual({
    //     willExit: false,
    //     shouldForceClose: true,
    //   });
    // });

    // it('should force exit if leftover daemon overlap with sequence and fit buffer', () => {
    //   const bufferSize = 5;
    //   const daemons: DaemonsRawData = [
    //     ['55', 'BD', 'BD', '1C'],
    //     ['1C', '7A'],
    //   ];
    //   const [p1] = parseDaemons(daemons);
    //   const s1 = Sequence.fromPermutation(p1.slice(0, 1));
    //   const result = new BreachProtocol(
    //     {
    //       grid,
    //       bufferSize,
    //       daemons,
    //     },
    //     options
    //   ).solveForSequence(s1);

    //   expect(result.exitStrategy).toEqual({
    //     willExit: false,
    //     shouldForceClose: true,
    //   });
    // });
  });
});

function expectResolvedSequenceToContainDaemons(result: BreachProtocolResult) {
  result.sequence.parts.forEach((d) => {
    expect(result.resolvedSequence.tValue).toContain(d.tValue);
  });
}
