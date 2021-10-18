import { Point } from '@/common';
import { GridRawData } from '../common';
import {
  BreachProtocolCodeFragment,
  BreachProtocolFragmentResult,
  BreachProtocolFragmentStatus,
} from './base';

export type BreachProtocolGridFragmentResult = BreachProtocolFragmentResult<
  GridRawData,
  'grid'
>;

export class BreachProtocolGridFragment<
  TImage
> extends BreachProtocolCodeFragment<GridRawData, TImage, 'grid'> {
  readonly thresholds = new Map([
    [1080, 120],
    [1440, 120],
    [2160, 120],
  ]);

  readonly id = 'grid';

  readonly p1 = new Point(0.137, 0.312);

  readonly p2 = new Point(0.383, 0.76);

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.processGridFragment(
    this.boundingBox
  );

  protected getRawData(lines: string[]) {
    return lines.flatMap((l) => this.parseLine(l));
  }

  private isSquare(n: number) {
    return n > 0 && Math.sqrt(n) % 1 === 0;
  }

  getStatus(rawData: GridRawData) {
    if (!this.isSquare(rawData.length)) {
      return BreachProtocolFragmentStatus.InvalidSize;
    }

    if (!this.validateSymbols(rawData)) {
      return BreachProtocolFragmentStatus.InvalidSymbols;
    }

    return BreachProtocolFragmentStatus.Valid;
  }
}
