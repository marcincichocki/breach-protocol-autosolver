import { Point } from '@/common';
import { DaemonsRawData } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolOCRFragment,
  BreachProtocolFragmentStatus,
} from './base';

export type BreachProtocolDaemonsFragmentResult = BreachProtocolFragmentResult<
  DaemonsRawData,
  'daemons'
>;

export class BreachProtocolDaemonsFragment<
  TImage
> extends BreachProtocolOCRFragment<DaemonsRawData, TImage, 'daemons'> {
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

  private isCorrectSize(rawData: DaemonsRawData) {
    return rawData.every((d) => d.length <= 5);
  }

  getStatus(rawData: DaemonsRawData) {
    if (!this.isCorrectSize(rawData)) {
      return BreachProtocolFragmentStatus.InvalidSize;
    }

    if (!this.validateSymbols(rawData.flat())) {
      return BreachProtocolFragmentStatus.InvalidSymbols;
    }

    return BreachProtocolFragmentStatus.Valid;
  }
}
