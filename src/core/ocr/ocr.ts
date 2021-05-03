import { Point } from '@/common';
import { writeFileSync } from 'fs-extra';
import {
  BreachProtocolRawData,
  COLS,
  cross,
  generateSquareMap,
  ROWS,
} from '../common';
import { FragmentId } from './base';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolBufferSizeFragmentResult,
} from './buffer-size';
import { BreachProtocolBufferSizeTrimFragment } from './buffer-size-trim';
import {
  BreachProtocolDaemonsFragment,
  BreachProtocolDaemonsFragmentResult,
} from './daemons';
import {
  BreachProtocolGridFragment,
  BreachProtocolGridFragmentResult,
} from './grid';
import { ImageContainer } from './image-container';

export class BreachProtocolRecognitionResult {
  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.toRawData();

  readonly valid = this.isValid();

  constructor(
    public readonly grid: BreachProtocolGridFragmentResult,
    public readonly daemons: BreachProtocolDaemonsFragmentResult,
    public readonly bufferSize: BreachProtocolBufferSizeFragmentResult
  ) {}

  saveFragments() {
    writeFileSync('./bufferSize.png', this.bufferSize.fragment);
    writeFileSync('./grid.png', this.grid.fragment);
    writeFileSync('./daemons.png', this.daemons.fragment);
  }

  toRawData(): BreachProtocolRawData {
    return {
      bufferSize: this.bufferSize.rawData,
      daemons: this.daemons.rawData,
      grid: this.grid.rawData,
    };
  }

  private getSquares(length: number) {
    const size = Math.sqrt(length);
    const rows = ROWS.slice(0, size);
    const cols = COLS.slice(0, size);

    return cross(rows, cols);
  }

  private getPositionSquareMap() {
    const { top, left } = this.grid.boundingBox;
    const boxes = this.grid.source.words.map((w) => w.bbox);
    const squares = this.getSquares(boxes.length);

    return generateSquareMap(squares, (s, i) => {
      const { x0, y0, x1, y1 } = boxes[i];
      const x = Math.round((x0 + x1) / 2);
      const y = Math.round((y0 + y1) / 2);

      return new Point(x + left, y + top);
    });
  }

  private isValid() {
    return this.bufferSize.isValid && this.grid.isValid && this.daemons.isValid;
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

  const [g, d, b] = await Promise.all([
    gridFragment.recognize(thresholds?.grid),
    daemonsFragment.recognize(thresholds?.daemons),
    bufferSizeFragment.recognize(thresholds?.bufferSize),
  ]);

  return new BreachProtocolRecognitionResult(g, d, b);
}
