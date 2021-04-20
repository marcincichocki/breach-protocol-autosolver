import { Point } from '@/common';
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

export class BreachProtocolRecognitionResult<C> {
  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.toRawData();

  constructor(
    public readonly grid: BreachProtocolGridFragmentResult<C>,
    public readonly daemons: BreachProtocolDaemonsFragmentResult<C>,
    public readonly bufferSize: BreachProtocolBufferSizeFragmentResult<C>
  ) {}

  toRawData(): BreachProtocolRawData {
    return {
      bufferSize: this.bufferSize.rawData,
      daemons: this.daemons.rawData,
      grid: this.grid.rawData,
    };
  }

  private getPositionSquareMap() {
    const { top, left } = this.grid.boundingBox;
    const lines = this.grid.source.hocr
      .split('\n')
      .filter((l) => l.includes('ocrx_word'));
    const size = Math.sqrt(lines.length);
    const squares = cross(ROWS.slice(0, size), COLS.slice(0, size));
    const bounds = lines
      .map((l) => l.match(/(?<=bbox )(\d|\s)*/g)[0])
      .map((l) => l.split(/\s/).map(Number));

    return generateSquareMap(squares, (s, i) => {
      const [x, y] = bounds[i];

      // this is top left corner of each square
      return new Point(x + left, y + top);
    });
  }
}

export async function breachProtocolOCR<C>(
  container: ImageContainer<C>,
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

  return new BreachProtocolRecognitionResult<C>(g, d, b);
}
