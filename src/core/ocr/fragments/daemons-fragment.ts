import { Point } from '@/common';
import {
  DaemonsRawData,
  DAEMONS_SIZE_MAX,
  DAEMONS_SIZE_MIN,
  DAEMON_SIZE_MAX,
  DAEMON_SIZE_MIN,
} from '../../common';
import {
  BreachProtocolCodeFragment,
  BreachProtocolFragmentResult,
} from './base';
import { FragmentId, FragmentStatus } from './fragment';

export type BreachProtocolDaemonsFragmentResult = BreachProtocolFragmentResult<
  DaemonsRawData,
  FragmentId.Daemons
>;

export class BreachProtocolDaemonsFragment<
  TImage
> extends BreachProtocolCodeFragment<
  DaemonsRawData,
  TImage,
  FragmentId.Daemons
> {
  readonly thresholds = new Map([
    [1080, 60],
    [1440, 45],
    [2160, 10],
  ]);

  readonly id = FragmentId.Daemons;

  readonly p1 = new Point(0.42, 0.312);

  readonly p2 = new Point(
    this.options.extendedDaemonsAndTypesRecognitionRange ? 0.664 : 0.59,
    this.options.extendedDaemonsAndTypesRecognitionRange ? 0.847 : 0.729
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.toFragmentContainer({
    boundingBox: this.boundingBox,
    channel: 'blue',
    colors: 2,
    width: 450,
  });

  protected getRawData(lines: string[]) {
    return lines.map((l) => this.parseLine(l));
  }

  private isCorrectSize(rawData: DaemonsRawData) {
    if (
      rawData.length < DAEMONS_SIZE_MIN ||
      rawData.length > DAEMONS_SIZE_MAX
    ) {
      return false;
    }

    return !rawData.some(
      ({ length }) => length < DAEMON_SIZE_MIN || length > DAEMON_SIZE_MAX
    );
  }

  getStatus(rawData: DaemonsRawData) {
    if (
      !this.options.extendedDaemonsAndTypesRecognitionRange &&
      !this.isCorrectSize(rawData)
    ) {
      return FragmentStatus.InvalidSize;
    }

    if (!this.validateSymbols(rawData.flat())) {
      return FragmentStatus.InvalidSymbols;
    }

    return FragmentStatus.Valid;
  }
}
