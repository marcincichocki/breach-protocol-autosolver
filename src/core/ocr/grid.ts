import { Point } from '@/common';
import { HexNumber } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolOCRFragment,
} from './base';

export type BreachProtocolGridFragmentResult<C> = BreachProtocolFragmentResult<
  HexNumber[],
  Tesseract.Page,
  C
>;

export class BreachProtocolGridFragment<C> extends BreachProtocolOCRFragment<
  HexNumber[],
  Tesseract.Page,
  C
> {
  readonly thresholds = new Map([
    [1080, 120],
    [1440, 120],
    [2160, 120],
  ]);

  readonly id = 'grid';

  readonly p1 = new Point(0.137, 0.312);

  readonly p2 = new Point(0.383, 0.76);

  private getRawGrid(lines: string[]) {
    return lines.flatMap((l) => this.parseLine(l));
  }

  private isSquare(n: number) {
    return n > 0 && Math.sqrt(n) % 1 === 0;
  }

  isValid(rawData: HexNumber[]) {
    return this.validateSymbols(rawData) && this.isSquare(rawData.length);
  }

  async recognize(threshold?: number) {
    const { data, boundingBox, fragment } = await this.ocr(
      threshold ?? this.getThreshold()
    );
    const lines = this.getLines(data.text);
    const rawData = this.getRawGrid(lines);

    if (!this.isValid(rawData)) {
      // TODO: throw validation error with data or smth
      throw new Error('grid is not valid');
    }

    return new BreachProtocolFragmentResult(
      this.id,
      data,
      boundingBox,
      rawData,
      fragment
    ) as BreachProtocolGridFragmentResult<C>;
  }
}
