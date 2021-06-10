import { Serializable } from '@/common';
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
import {
  makeSequences,
  memoizedFindOverlap,
  Sequence,
  SequenceJSON,
} from './sequence';

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

/**
 * Provides methods to find solution for given rawData
 */
export class BreachProtocol {
  // Grid is always a square.
  private readonly size = Math.sqrt(this.rawData.grid.length);

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

  public readonly sequences = makeSequences(
    this.rawData.daemons,
    this.rawData.bufferSize
  );

  constructor(public readonly rawData: BreachProtocolRawData) {}

  solveForSequence(sequence: Sequence) {
    const path = this.findPath(sequence.tValue);

    return path ? new BreachProtocolResult(sequence, path, this) : null;
  }

  /**
   * Try to solve current grid with provided sequences.
   * If no sequences were provided, all permutations of
   * given daemons are used.
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

  private findPath(
    sequence: string,
    ignoreFound = false,
    gridMap: Map<string, string> = this.gridMap,
    square: string = 'A1',
    dir: 0 | 1 = 0,
    subPath: string[] = [],
    bufferLeft: number = this.rawData.bufferSize,
    fullSequence = ''
  ): string[] {
    if (bufferLeft - sequence.length < 0) return null;
    if (!sequence) return subPath;
    if (!fullSequence) {
      fullSequence = sequence;
    }

    const unit = this.unitsMap.get(square)[dir];
    const found = unit.filter((s) => String(gridMap.get(s)) === sequence[0]);
    const useFound = found.length && !ignoreFound;
    const newSquares = useFound
      ? found
      : unit.filter((s) => gridMap.get(s) !== null);

    for (let newSquare of newSquares) {
      const newPath = subPath.slice();
      const newGrid = new Map(gridMap);

      newPath.push(newSquare);
      newGrid.set(newSquare, null);

      const newSequence = useFound
        ? sequence.slice(1)
        : String(gridMap.get(newSquare)) === fullSequence[0]
        ? fullSequence.slice(1)
        : fullSequence;

      const result = this.findPath(
        newSequence,
        false,
        newGrid,
        newSquare,
        (dir ^ 1) as 0 | 1,
        newPath,
        bufferLeft - 1,
        fullSequence
      );

      if (result) {
        return result;
      }
    }

    // If buffer is empty, but there are no results, restart
    // search and match any square.
    if (bufferLeft === this.rawData.bufferSize && !ignoreFound) {
      return this.findPath(fullSequence, true);
    }

    return null;
  }
}
