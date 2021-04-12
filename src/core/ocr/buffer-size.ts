import { Point } from '@/common';
import {
  BreachProtocolFragment2,
  BreachProtocolFragmentBoundingBox,
  BreachProtocolFragmentResult,
} from './base';
import { BufferSize, validateBufferSize } from '../common';
import sharp from 'sharp';

export class BreachProtocolBufferSizeFragment<
  I
> extends BreachProtocolFragment2<BufferSize, Buffer, I> {
  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(0.7, 0.225);
  // readonly p2 = new Point(0.669, 0.225);

  // THIS THING SHOULD BE MUTABLE BECAUSE IF WE FIND SHIT ONCE
  // THEN ITS GOOD LATER, UNLESS USER CHANGES GAMMA WHICH
  // WILL RUN REPEAT AGAIN.
  readonly threshold = 230;

  static threshold = 230;

  readonly thresholdBase = 150;

  /** Percentage that padding in buffer box takes. */
  private readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  private readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  private readonly gap = 0.00546;

  private attempt = 0;

  fragment: sharp.Sharp;

  isValid() {
    // TODO: add
    return true;
  }

  async recognize(
    threshold = this.thresholdBase
  ): Promise<BreachProtocolFragmentResult<BufferSize, Buffer>> {
    // console.log(`Attempt no: ${this.attempt} ${threshold}`);

    const boundingBox = this.getFragmentBoundingBox();
    const fragment = await this.container.process(
      this.attempt === 0
        ? BreachProtocolBufferSizeFragment.threshold
        : threshold,
      boundingBox
    );

    // const buffer = await fragment.clone().toBuffer();
    // const rawBuffer = await fragment.clone().raw().toBuffer();
    const rawBuffer = await this.container.toRawBuffer(fragment);
    const bufferSize = this.getBufferSizeFromPixels(rawBuffer, boundingBox);

    if (!validateBufferSize(bufferSize)) {
      if ((threshold += 5) <= 256) {
        // recursively try again
        this.attempt += 1;
        return await this.recognize(threshold);
      }

      throw new Error('shit is wrong');
    }

    // console.log('saving threshold %s', threshold);

    // this.fragment = fragment;
    BreachProtocolBufferSizeFragment.threshold = threshold;

    return new BreachProtocolFragmentResult(rawBuffer, boundingBox, bufferSize);
  }

  private getSizeOfBufferBox(
    pixels: Buffer,
    boundingBox: BreachProtocolFragmentBoundingBox
  ) {
    const step = 3; // rgb
    const rowLength = boundingBox.width * step;
    const row = pixels.subarray(0, rowLength);
    // TODO: check if buffer size 9 will work with this control group.
    const controlGroup = row.subarray(rowLength - 100 * step, rowLength);
    let size = 0;

    // Check if every pixel in control group is black.
    // If it is not, fragment is considered invalid, because
    // it could return incorrect buffer size.
    if (!controlGroup.every((p) => p === 0)) {
      return 0;
    }

    for (let i = step - 1; i < row.length; i += step) {
      const isWhite = row.slice(i - 2, i).every((x) => x === 255);

      if (isWhite) {
        size += 1;
      }
    }

    return size;
  }

  private getBufferSizeFromPixels(
    pixels: Buffer,
    boundingBox: BreachProtocolFragmentBoundingBox
  ) {
    let size =
      this.getSizeOfBufferBox(pixels, boundingBox) / boundingBox.outerWidth;
    let bufferSize = 0;

    size -= 2 * this.padding;

    while (size > 0) {
      size -= this.square + this.gap;
      bufferSize += 1;
    }

    return bufferSize as BufferSize;
  }
}
