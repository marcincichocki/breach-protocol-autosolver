import { Point } from '@/common';
import {
  BreachProtocolRawData,
  COLS,
  cross,
  generateSquareMap,
  isGridFragment,
  ROWS,
} from '../common';
import { BreachProtocolFragmentResults, FragmentId } from './base';
import { BreachProtocolBufferSizeFragment } from './buffer-size';
import { BreachProtocolBufferSizeTrimFragment } from './buffer-size-trim';
import { BreachProtocolDaemonsFragment } from './daemons';
import { BreachProtocolGridFragment } from './grid';
import { ImageContainer } from './image-container';

export class BreachProtocolRecognitionResult {
  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.reduceToRawData();

  readonly isValid = this.results.every((r) => r.isValid);

  constructor(public readonly results: BreachProtocolFragmentResults) {}

  getInvalidFragmentIds() {
    return this.results.filter((r) => !r.isValid).map((r) => r.id);
  }

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

export async function breachProtocolOCR<TImage>(
  container: ImageContainer<TImage>,
  thresholds?: Partial<Record<FragmentId, number>>,
  experimentalBufferSizeRecognition?: boolean
) {
  const gridFragment = new BreachProtocolGridFragment(container);
  const daemonsFragment = new BreachProtocolDaemonsFragment(container);
  const bufferSizeFragment = experimentalBufferSizeRecognition
    ? new BreachProtocolBufferSizeTrimFragment(container)
    : new BreachProtocolBufferSizeFragment(container);

  const results = await Promise.all([
    gridFragment.recognize(thresholds?.grid),
    daemonsFragment.recognize(thresholds?.daemons),
    bufferSizeFragment.recognize(thresholds?.bufferSize),
  ]);

  return new BreachProtocolRecognitionResult(results);
}
