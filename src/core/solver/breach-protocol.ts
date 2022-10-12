import { Serializable } from '@/common';
import {
  BreachProtocolExitStrategy,
  BreachProtocolRawData,
  BUFFER_SIZE_MAX,
  COLS,
  cross,
  fromHex,
  generateSquareMap,
  getUnits,
  ROWS,
  toHex,
} from '../common';
import { Daemon } from './daemon';
import { HierarchyProvider } from './hierarchy/hierarchy-provider';
import { memoizedFindOverlap } from './overlap';
import { Sequence, SequenceJSON } from './sequence';
import { SequenceFactory } from './sequence-factory';

export type BreachProtocolResultJSON = {
  path: string[];
  rawPath: string[];
  sequence: SequenceJSON;
  resolvedSequence: SequenceJSON;
  exitStrategy: BreachProtocolExitStrategy;
};

export class BreachProtocolResult implements Serializable {
  public readonly path = this.rawPath.slice(0, this.findEndIndex());

  public readonly resolvedSequence = this.getResolvedSequence();

  public readonly exitStrategy = this.resolveExitStrategy();

  constructor(
    public readonly sequence: Sequence,
    public readonly rawPath: string[],
    public readonly game: BreachProtocol
  ) {}

  toJSON(): BreachProtocolResultJSON {
    const { path, rawPath, exitStrategy } = this;

    return {
      path,
      rawPath,
      exitStrategy,
      sequence: this.sequence.toJSON(),
      resolvedSequence: this.resolvedSequence.toJSON(),
    };
  }

  private resolveExitStrategy(): BreachProtocolExitStrategy {
    const { tValue: base } = this.resolvedSequence;
    const { bufferSize, daemons } = this.game.rawData;

    // BP will exit automatically when all of the buffer has been used.
    const willExit = this.path.length === bufferSize;

    // Get daemons that were not used in resolved sequence.
    // There is no point of finding shortest daemon,
    // since in very rare cases longer daemon could create
    // better sequence than its shorter peers(bigger overlap).
    const shouldForceClose = daemons
      .filter((d, i) => !this.sequence.indexes.includes(i))
      .some((d) => {
        const daemon = d.map(fromHex).join('');
        const r = memoizedFindOverlap(base, daemon);

        // If potential result(which will never happen) will
        // "fit" in a buffer, then exit again(once to stop,
        // second time to exit).
        // Otherwise user will have to exit manually.
        return r.length <= bufferSize;
      });

    return {
      willExit,
      shouldForceClose,
    };
  }

  private resolvePath(path: string[]) {
    return path.map((s) => this.game.gridMap.get(s));
  }

  private findEndIndex() {
    const resolved = this.resolvePath(this.rawPath).join('');
    const indexes = this.sequence.parts.map(
      (d) => resolved.indexOf(d.tValue) + d.length
    );

    return Math.max(...indexes);
  }

  private getResolvedSequenceParts(tValue: string) {
    if (tValue !== this.sequence.tValue) {
      // In rare cases, daemons can be solved by accident.
      // This can happen when daemon is is delayed on a sequence break.
      const pts = this.sequence.parts.map(({ tValue }) => tValue);

      return this.game.rawData.daemons
        .map((raw, index) => ({ dt: raw.map(fromHex).join(''), index }))
        .filter(({ dt }) => !pts.includes(dt))
        .filter(({ dt }) => tValue.includes(dt))
        .map(({ dt, index }) => new Daemon(dt.split('').map(toHex), index))
        .concat(this.sequence.parts);
    }

    return this.sequence.parts;
  }

  // Produces sequence from resolved path.
  private getResolvedSequence() {
    const tValue = this.resolvePath(this.path).join('');
    const value = tValue.split('').map(toHex);
    const parts = this.getResolvedSequenceParts(tValue);

    return new Sequence(value, parts);
  }
}

export interface BreachProtocolOptions {
  strategy: BreachProtocolStrategy;
  hierarchyProvider: HierarchyProvider<BreachProtocolRawData>;
}

export type BreachProtocolStrategy = 'dfs' | 'bfs';

export class BreachProtocol {
  // Grid is always a square.
  readonly size = Math.sqrt(this.rawData.grid.length);

  private readonly isBufferSizeOverMax =
    this.rawData.bufferSize > BUFFER_SIZE_MAX;

  // Rows and columns trimmed to right size.
  private readonly rows = ROWS.slice(0, this.size);
  private readonly cols = COLS.slice(0, this.size);

  // List of all possible elements in the grid(squares).
  private readonly squares = cross(this.rows, this.cols);

  // Unit is list of squares in one direction. Either row or column.
  private readonly units = getUnits(this.rows, this.cols);

  // Map of each square and corresponding units. Index 0 is row, index 1 is column.
  private readonly unitsMap = generateSquareMap(this.squares, (s) =>
    this.units.filter((u) => u.includes(s))
  );

  // Map of each square and corresponding grid value.
  readonly gridMap = generateSquareMap(this.squares, (s, i) =>
    fromHex(this.rawData.grid[i])
  );

  private readonly factory = new SequenceFactory(this.rawData, {
    hierarchy: this.options.hierarchyProvider.provide(this.rawData),
  });

  constructor(
    public readonly rawData: BreachProtocolRawData,
    private readonly options: BreachProtocolOptions
  ) {}

  solveForSequence(sequence: Sequence) {
    const path = this.findPath(sequence);

    return path ? new BreachProtocolResult(sequence, path, this) : null;
  }

  /** Solve grid with every sequence. */
  *solveAll() {
    for (const sequence of this.factory.getSequences()) {
      const result = this.solveForSequence(sequence);

      if (result) {
        yield result;
      }
    }
  }

  solve() {
    const { value } = this.solveAll().next();

    if (value) {
      return value;
    }

    return null;
  }

  private getInitialQueue(sequence: string) {
    const startRow = this.unitsMap.get('A1')[0];

    return startRow.map((s) => {
      const match = this.gridMap.get(s) === sequence[0];
      const tail = match ? sequence.slice(1) : sequence;

      return { tail, path: [s] };
    });
  }

  private findNewTail(
    tail: string,
    square: string,
    { tValue, breaks }: Sequence
  ) {
    const value = this.gridMap.get(square);

    // Match found, slice first element from tail.
    if (value === tail[0]) {
      return tail.slice(1);
    }

    const index = tValue.lastIndexOf(tail);

    // Match was not found, but is possible to break the sequence.
    // Use same tail for next iteration.
    if (breaks.includes(index)) {
      return tail;
    }

    // Start from the beginning without first value if it matches.
    if (value === tValue[0]) {
      return tValue.slice(1);
    }

    // Worst case, nothing matches, start from the beginning.
    return tValue;
  }

  private reduceQueue(queue: { tail: string; path: string[] }[]) {
    return queue
      .sort((a, b) => a.tail.length - b.tail.length)
      .slice(0, Math.ceil(queue.length / 2));
  }

  private findPath(sequence: Sequence) {
    return this.options.strategy === 'dfs'
      ? this.dfs(sequence)
      : this.bfs(sequence);
  }

  /**
   * Find shortest path that fulfills given sequence using breadth first search.
   *
   * This strategy will limit number of permutations when buffer is bigger than max
   * to preserve performance. It can affect results.
   */
  bfs(sequence: Sequence) {
    const { bufferSize } = this.rawData;
    let queue = this.getInitialQueue(sequence.tValue);

    while (queue.length) {
      if (this.isBufferSizeOverMax && queue.length > 20e2) {
        queue = this.reduceQueue(queue);
      }

      // Get first element from queue.
      const { path, tail } = queue.shift();

      if (!tail.length) {
        // Solution found, return path.
        return path.reverse();
      }

      if (bufferSize - path.length < tail.length) {
        // Not enough space in the buffer, skip this iteration.
        continue;
      }

      const [square] = path;
      const unit = this.unitsMap.get(square)[path.length % 2];
      const nextSquares = unit
        .filter((s) => !path.includes(s))
        .map((square) => ({
          path: [square, ...path],
          tail: this.findNewTail(tail, square, sequence),
        }));

      queue.push(...nextSquares);
    }
  }

  /**
   * Find path that fulfills given sequence using depth first search.
   *
   * This strategy will not limit number of permutations and can get really slow
   * when buffer size is over max.
   */
  private dfs(sequence: Sequence) {
    const queue = this.getInitialQueue(sequence.tValue);

    for (let { path, tail } of queue) {
      const result = this.runDfs(sequence, path, tail);

      if (result) {
        return result;
      }
    }

    return null;
  }

  private runDfs(sequence: Sequence, path: string[], tail: string): string[] {
    if (this.rawData.bufferSize - path.length < tail.length) {
      return null;
    }

    if (!tail.length) {
      return path.reverse();
    }

    const [square] = path;
    const unit = this.unitsMap.get(square)[path.length % 2];
    const nextSquares = unit
      .filter((s) => !path.includes(s))
      .map((square) => ({
        path: [square, ...path],
        tail: this.findNewTail(tail, square, sequence),
      }));

    for (let { path: newPath, tail: newTail } of nextSquares) {
      const result = this.runDfs(sequence, newPath, newTail);

      if (result) {
        return result;
      }
    }

    return null;
  }
}
