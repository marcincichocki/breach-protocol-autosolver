import {
  COLS,
  ROWS,
  cross,
  generateSquareMap,
  getUnits,
  BufferSize,
} from './common';
import { Sequence } from './sequence';

class BreachProtocolResult {
  constructor(
    public readonly sequence: Sequence,
    public readonly path: string[],
    public readonly breachProtocol: BreachProtocol
  ) {}

  /**
   * Produces sequence from resolved path.
   */
  getResolvedSequence() {
    return this.path.map((s) => this.breachProtocol.gridMap.get(s)).join('');
  }
}

export class BreachProtocol {
  // Grid is always a square.
  private readonly size = Math.sqrt(this.grid.length);

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
  readonly gridMap = generateSquareMap(this.squares, (s, i) => this.grid[i]);

  constructor(
    public grid: string[], // public deamons: string[], // public bufferSize: BufferSize
    public bufferSize: BufferSize
  ) {}

  solveForSequence(sequence: Sequence) {
    const path = this.findPath(sequence.value);

    return path ? new BreachProtocolResult(sequence, path, this) : null;
  }

  /**
   * Try to solve current grid with provided sequences.
   *
   * @param sequences List of sequences to try.
   */
  solve(sequences: Sequence[]) {
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
    gridMap: Map<string, string> = this.gridMap,
    square: string = 'A1',
    dir: 0 | 1 = 0,
    subPath: string[] = [],
    bufferLeft: number = this.bufferSize,
    fullSequence = ''
  ): string[] {
    if (bufferLeft - sequence.length < 0) return null;
    if (!sequence) return subPath;
    if (!fullSequence) {
      fullSequence = sequence;
    }

    const unit = this.unitsMap.get(square)[dir];
    const found = unit.filter((s) => String(gridMap.get(s)) === sequence[0]);
    const newSquares = found.length
      ? found
      : unit.filter((s) => gridMap.get(s) !== null);

    for (let newSquare of newSquares) {
      const newPath = subPath.slice();
      const newGrid = new Map(gridMap);

      newPath.push(newSquare);
      newGrid.set(newSquare, null);

      const newSequence = found.length
        ? sequence.slice(1)
        : String(gridMap.get(newSquare)) === fullSequence[0]
        ? fullSequence.slice(1)
        : fullSequence;

      const result = this.findPath(
        newSequence,
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

    return null;
  }
}
