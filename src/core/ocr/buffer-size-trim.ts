import { Point } from '@/common';
import { BufferSize, BUFFER_SIZE_MAX, BUFFER_SIZE_MIN } from '../common';
import { BreachProtocolFragment } from './base';
import { BreachProtocolBufferSizeFragmentResult } from './buffer-size';

export class BreachProtocolBufferSizeTrimFragment<
  TImage
> extends BreachProtocolFragment<BufferSize, TImage, 'bufferSize'> {
  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(0.8, 0.225);

  readonly boundingBox = this.getFragmentBoundingBox();

  readonly fragment = this.container.processBufferSizeFragment(
    this.boundingBox
  );

  /** Percentage that padding in buffer box takes. */
  private readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  private readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  private readonly gap = 0.00546;

  isValid(n: number) {
    return Number.isInteger(n) && n >= BUFFER_SIZE_MIN && n <= BUFFER_SIZE_MAX;
  }

  // Ensure compatibility with current api.
  async recognize(
    threshold?: number
  ): Promise<BreachProtocolBufferSizeFragmentResult> {
    const { buffer, width } = await this.container.trim(this.fragment);
    const bufferSize = await this.getBufferSizeFromPixels(width);

    return {
      ...(this.getBaseResultData(bufferSize) as any),
      source: null,
      rawData: bufferSize,
      image: buffer.toString('base64'),
      threshold: null,
    };
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
