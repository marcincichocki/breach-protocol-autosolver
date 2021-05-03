import { Point, t } from '@/common';
import { BreachProtocolValidationError, HexNumber } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolOCRFragment,
} from './base';

export type BreachProtocolGridFragmentResult = BreachProtocolFragmentResult<
  HexNumber[],
  Tesseract.Page
>;

export class BreachProtocolGridFragment<
  TImage
> extends BreachProtocolOCRFragment<HexNumber[], TImage> {
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

  protected getValidationError(result: BreachProtocolGridFragmentResult) {
    return new BreachProtocolValidationError(t`GRID_INVALID`, result);
  }

  private isSquare(n: number) {
    return n > 0 && Math.sqrt(n) % 1 === 0;
  }

  isValid(rawData: HexNumber[]) {
    return this.validateSymbols(rawData) && this.isSquare(rawData.length);
  }
}
