import { Point } from '@/common';
import {
  BreachProtocolRawData,
  COLS,
  cross,
  generateSquareMap,
  isGridFragment,
  ROWS,
} from '../common';
import {
  BreachProtocolFragmentResults,
  FragmentId,
  FragmentResult,
} from './fragments';

export class BreachProtocolRecognitionResult {
  readonly results = this.unsafeResults.filter(
    Boolean
  ) as BreachProtocolFragmentResults;

  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.reduceToRawData();

  readonly isValid = this.results
    // daemon types can be undedected
    .filter((r) => r.id !== FragmentId.Types)
    .every((r) => r.isValid);

  constructor(private readonly unsafeResults: FragmentResult<unknown>[]) {}

  private reduceToRawData(): BreachProtocolRawData {
    return this.results.reduce(
      (result, { id, rawData }) => ({
        ...result,
        [id]: rawData,
      }),
      {} as BreachProtocolRawData
    );
  }

  private getSquares(length: number) {
    const size = Math.sqrt(length);
    const rows = ROWS.slice(0, size);
    const cols = COLS.slice(0, size);

    return cross(rows, cols);
  }

  private getPositionSquareMap() {
    const grid = this.results.find(isGridFragment);
    const { top, left } = grid.boundingBox;
    const { boxes } = grid.source;
    const squares = this.getSquares(boxes.length);

    return generateSquareMap(squares, (s, i) => {
      const { x0, y0, x1, y1 } = boxes[i];
      const x = Math.round((x0 + x1) / 2);
      const y = Math.round((y0 + y1) / 2);

      return new Point(x + left, y + top);
    });
  }
}
