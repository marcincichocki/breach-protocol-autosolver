import { BufferSize } from '../common';
import { BreachProtocolBufferSizeBase } from './base';
import { BreachProtocolBufferSizeFragmentResult } from './buffer-size';

export class BreachProtocolBufferSizeTrimFragment<
  TImage
> extends BreachProtocolBufferSizeBase<TImage> {
  override readonly fragment = this.container.processBufferSizeFragment(
    this.boundingBox
  );

  // Ensure compatibility with current api.
  async recognize(
    threshold?: number
  ): Promise<BreachProtocolBufferSizeFragmentResult> {
    const { buffer, width } = await this.trimFragment();
    const bufferSize = await this.getBufferSizeFromPixels(width);

    return this.getFragmentResult(null, bufferSize, buffer, null);
  }

  private async trimFragment() {
    try {
      return await this.container.trim(this.fragment);
    } catch (e) {
      const buffer = await this.container.toBuffer(this.fragment);

      return { buffer, width: 0 };
    }
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
