import { Point } from '@/common';
import { HexNumber } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolOCRFragment,
} from './base';

type DaemonsData = HexNumber[][];

export type BreachProtocolDaemonsFragmentResult = BreachProtocolFragmentResult<
  DaemonsData,
  'daemons'
>;

export class BreachProtocolDaemonsFragment<
  TImage
> extends BreachProtocolOCRFragment<DaemonsData, TImage, 'daemons'> {
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

  isValid(rawData: DaemonsData) {
    const isCorrectSize = rawData.every((d) => d.length <= 5);

    return this.validateSymbols(rawData.flat()) && isCorrectSize;
  }
}
