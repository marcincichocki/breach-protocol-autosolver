import { Serializable } from '@/common';
import { v4 as uuidv4 } from 'uuid';
import {
  BreachProtocolExitStrategy,
  BreachProtocolRawData,
  COLS,
  cross,
  fromHex,
  generateSquareMap,
  getUnits,
  ROWS,
  toHex,
} from './common';
import { SequenceCompareStrategy } from './compare-strategy';
import {
  generateSequences,
  memoizedFindOverlap,
  Sequence,
  SequenceJSON,
} from './sequence';

export type BreachProtocolResultJSON = {
  uuid?: string;
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

  public readonly uuid = uuidv4();

  constructor(
    public readonly sequence: Sequence,
    public readonly rawPath: string[],
    public readonly game: BreachProtocol
  ) {}

  toJSON(): BreachProtocolResultJSON {
    const { path, rawPath, exitStrategy, uuid } = this;

    return {
      uuid,
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
    // There is no point of finding shorthest daemon,
    // since in very rare cases longer daemon could create
    // better sequence than its shorther peers(bigger overlap).
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

  // Produces sequence from resolved path.
  private getResolvedSequence() {
    const value = this.resolvePath(this.path).map(toHex);

    return new Sequence(value, this.sequence.parts);
  }
}

export class BreachProtocol {
  // Grid is always a square.
  readonly size = Math.sqrt(this.rawData.grid.length);

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

  public readonly sequences = generateSequences(
    this.rawData,
    this.compareStrategy
  );

  constructor(
    public readonly rawData: BreachProtocolRawData,
    private readonly compareStrategy?: SequenceCompareStrategy
  ) {}

  solveForSequence(sequence: Sequence) {
    const path = this.findShortestPath(sequence);

    return path ? new BreachProtocolResult(sequence, path, this) : null;
  }

  /** Solve grid with every sequence. */
  solveAll(sequences: Sequence[] = this.sequences) {
    return sequences.map((s) => this.solveForSequence(s));
  }

  /**
   * Try to solve current grid with provided sequences or
   * sequences produced from daemons.
   *
   * @param sequences List of sequences to try.
   */
  solve(sequences: Sequence[] = this.sequences) {
    if (!sequences.length) {
      return null;
    }

    let result: BreachProtocolResult;
    let i = 0;

    do {
      result = this.solveForSequence(sequences[i]);
    } while (!result && ++i < sequences.length);

    return result;
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

    // Start from the begining without first value if it matches.
    if (value === tValue[0]) {
      return tValue.slice(1);
    }

    // Worst case, nothing matches, start from the begining.
    return tValue;
  }

  /**
   * Find shortest path that fulfills given sequence using
   * breadth first search. Supports sequence delagation on breaks.
   */
  private findShortestPath(sequence: Sequence) {
    const { bufferSize } = this.rawData;
    const queue = this.getInitialQueue(sequence.tValue);

    while (queue.length) {
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
}
