import { Point } from '@/common';
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
  Tesseract.Page,
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

  protected getRawDaemons(lines: string[]) {
    return lines.map((l) => this.parseLine(l));
  }

  isValid(rawData: HexNumber[][]) {
    const isCorrectSize = rawData.every((d) => d.length <= 5);

    return this.validateSymbols(rawData.flat()) && isCorrectSize;
  }

  async recognize(threshold?: number) {
    const { data, boundingBox, fragment } = await this.ocr(
      threshold ?? this.getThreshold()
    );
    const lines = this.getLines(data.text);
    const rawData = this.getRawDaemons(lines);
    const result = new BreachProtocolFragmentResult(
      this.id,
      data,
      boundingBox,
      rawData,
      fragment
    ) as BreachProtocolDaemonsFragmentResult<C>;

    if (!this.isValid(rawData)) {
      throw new BreachProtocolValidationError('daemons are not valid', result);
    }

    return result;
  }
}
