import { Point } from '@/common';
import { HexNumber } from '../common';
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
  readonly id = 'daemons';

  readonly p1 = new Point(0.42, 0.312);

  readonly p2 = new Point(0.59, 0.76);

  // TODO: check if this is correct on all resolutions.
  readonly threshold = 45;

  protected getRawDaemons(lines: string[]) {
    return lines.map((l) => this.parseLine(l));
  }

  isValid(rawData: HexNumber[][]) {
    const isCorrectSize = rawData.every((d) => d.length <= 5);

    return this.validateSymbols(rawData.flat()) && isCorrectSize;
  }

  async recognize(
    threshold = this.threshold
  ): Promise<BreachProtocolDaemonsFragmentResult<C>> {
    const { data, boundingBox, fragment } = await this.ocr(threshold);
    const lines = this.getLines(data.text);
    const rawData = this.getRawDaemons(lines);

    if (!this.isValid(rawData)) {
      if ((threshold -= 10) > 0) {
        return await this.recognize(threshold);
      }

      // TODO: throw validation error
      throw new Error('daemons are not valid');
    }

    return new BreachProtocolFragmentResult(
      this.id,
      data,
      boundingBox,
      rawData,
      fragment
    ) as BreachProtocolDaemonsFragmentResult<C>;
  }
}
