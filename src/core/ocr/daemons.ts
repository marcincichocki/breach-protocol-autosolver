import { Point, t } from '@/common';
import { BreachProtocolValidationError, HexNumber } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolOCRFragment,
} from './base';

export type BreachProtocolDaemonsFragmentResult<
  C
> = BreachProtocolFragmentResult<HexNumber[][], Tesseract.Page, C>;

export class BreachProtocolDaemonsFragment<C> extends BreachProtocolOCRFragment<
  HexNumber[][],
  C
> {
  readonly thresholds = new Map([
    [1080, 60],
    [1440, 45],
    [2160, 10],
  ]);

  readonly id = 'daemons';

  readonly p1 = new Point(0.42, 0.312);

  readonly p2 = new Point(0.59, 0.76);

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.processDaemonsFragment(
    this.boundingBox
  );

  protected getRawData(lines: string[]) {
    return lines.map((l) => this.parseLine(l));
  }

  protected getValidationError(result: BreachProtocolDaemonsFragmentResult<C>) {
    return new BreachProtocolValidationError(t`DAEMONS_INVALID`, result);
  }

  isValid(rawData: HexNumber[][]) {
    const isCorrectSize = rawData.every((d) => d.length <= 5);

    return this.validateSymbols(rawData.flat()) && isCorrectSize;
  }
}
