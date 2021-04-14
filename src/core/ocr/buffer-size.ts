import { Point } from '@/common';
import { BufferSize, BUFFER_SIZE_MAX, BUFFER_SIZE_MIN } from '../common';
import {
  BreachProtocolFragment2,
  BreachProtocolFragmentBoundingBox,
  BreachProtocolFragmentResult,
} from './base';

class BufferSizeControlGroup {
  /** Thickness of control group in pixels. */
  private readonly size = 10;

  constructor(
    private start: number,
    private end: number,
    private value: number
  ) {}

  private getLineIndexes(length: number) {
    return [...Array(this.size)].map((x, i) => i * length);
  }

  /** Check if every pixel in control group has given value. */
  verify(pixels: Buffer, rowLength: number) {
    const startIndex = Math.round(this.start * rowLength);
    const endIndex = Math.round(this.end * rowLength);

    return this.getLineIndexes(rowLength)
      .map((n) => pixels.subarray(startIndex + n, endIndex + n))
      .every((line) => line.every((p) => p === this.value));
  }
}

export type BreachProtocolBufferSizeFragmentResult<
  C
> = BreachProtocolFragmentResult<BufferSize, Buffer, C>;

export class BreachProtocolBufferSizeFragment<
  C
> extends BreachProtocolFragment2<BufferSize, Buffer, C> {
  private readonly controlGroups = [
    // End of fragment.
    new BufferSizeControlGroup(0.7, 1, 0),
    // Buffer boxes.
    new BufferSizeControlGroup(0.12, 0.22, 255),
  ];

  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(0.8, 0.225);
  // readonly p2 = new Point(0.669, 0.225);

  // THIS THING SHOULD BE MUTABLE BECAUSE IF WE FIND SHIT ONCE
  // THEN ITS GOOD LATER, UNLESS USER CHANGES GAMMA WHICH
  // WILL RUN REPEAT AGAIN.
  readonly threshold = 230;

  // current threshold that works
  private static threshold = 255;

  readonly thresholdBase = 255;

  /** Percentage that padding in buffer box takes. */
  private readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  private readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  private readonly gap = 0.00546;

  private attempt = 0;

  isValid(n: number) {
    return Number.isInteger(n) && n >= BUFFER_SIZE_MIN && n <= BUFFER_SIZE_MAX;
  }

  async recognize(
    threshold = BreachProtocolBufferSizeFragment.threshold
  ): Promise<BreachProtocolBufferSizeFragmentResult<C>> {
    const boundingBox = this.getFragmentBoundingBox();
    const fragment = this.container.process(threshold, boundingBox);
    const rawBuffer = await this.container.toRawBuffer(fragment);
    const bufferSize = this.getBufferSizeFromPixels(rawBuffer, boundingBox);

    if (!this.isValid(bufferSize)) {
      if (this.attempt++ === 0) {
        threshold = this.thresholdBase;
      }

      if ((threshold -= 1) > 160) {
        return await this.recognize(threshold);
      }

      throw new Error('shit is wrong');
    }

    BreachProtocolBufferSizeFragment.threshold = threshold;

    return new BreachProtocolFragmentResult(
      this.id,
      rawBuffer,
      boundingBox,
      bufferSize,
      fragment
    ) as BreachProtocolBufferSizeFragmentResult<C>;
  }

  private verifyControlGroups(row: Buffer, length: number) {
    return this.controlGroups.every((cg) => cg.verify(row, length));
  }

  private getSizeOfBufferBox(pixels: Buffer, width: number) {
    const row = pixels.subarray(0, width);
    let size = 0;

    if (!this.verifyControlGroups(pixels, width)) {
      return 0;
    }

    for (let i = 0; i < row.length; i++) {
      if (row[i] === 255) {
        size += 1;
      }
    }

    return size;
  }

  private getBufferSizeFromPixels(
    pixels: Buffer,
    { width, outerWidth }: BreachProtocolFragmentBoundingBox
  ) {
    let size = this.getSizeOfBufferBox(pixels, width) / outerWidth;
    let bufferSize = 0;

    size -= 2 * this.padding;

    while (size > 0) {
      size -= this.square + this.gap;
      bufferSize += 1;
    }

    return bufferSize as BufferSize;
  }
}
