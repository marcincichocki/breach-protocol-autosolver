import { Point } from '@/common';
import { BufferSize, BUFFER_SIZE_MAX, BUFFER_SIZE_MIN } from '../../common';
import { BreachProtocolFragment, BreachProtocolFragmentResult } from './base';
import { FragmentId, FragmentStatus } from './fragment';

export type BreachProtocolBufferSizeFragmentResult =
  BreachProtocolFragmentResult<BufferSize, FragmentId.BufferSize>;

export class BreachProtocolBufferSizeFragment<
  TImage
> extends BreachProtocolFragment<BufferSize, TImage, FragmentId.BufferSize> {
  readonly id = FragmentId.BufferSize;

  readonly p1 = new Point(0.42, 0.167);
  readonly p2 = new Point(
    this.options.extendedBufferSizeRecognitionRange ? 0.863 : 0.8,
    0.225
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  /** Percentage that padding in buffer box takes. */
  protected readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  protected readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  protected readonly gap = 0.00546;

  readonly fragment = this.container.toFragmentContainer({
    boundingBox: this.boundingBox,
    flop: true,
  });

  async recognize(
    threshold?: number
  ): Promise<BreachProtocolBufferSizeFragmentResult> {
    const { uri, dimensions } = await this.fragment.toTrimmedBase64(
      threshold ?? 30
    );
    const bufferSize = await this.getBufferSizeFromPixels(dimensions.width);

    return this.getFragmentResult(null, bufferSize, uri, null);
  }

  getStatus(n: number) {
    if (
      !Number.isInteger(n) ||
      n < BUFFER_SIZE_MIN ||
      (!this.options.extendedBufferSizeRecognitionRange && n > BUFFER_SIZE_MAX)
    ) {
      return FragmentStatus.InvalidSize;
    }

    return FragmentStatus.Valid;
  }

  private async getBufferSizeFromPixels(width: number) {
    const { innerWidth } = this.boundingBox;

    let size = width / innerWidth;
    let bufferSize = 0;

    size -= 2 * this.padding;

    while (size > 0) {
      size -= this.square + this.gap;
      bufferSize += 1;
    }

    return bufferSize as BufferSize;
  }
}
