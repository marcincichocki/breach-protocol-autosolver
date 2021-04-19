import { Point, t } from '@/common';
import {
  BreachProtocolValidationError,
  BufferSize,
  BUFFER_SIZE_MAX,
  BUFFER_SIZE_MIN,
} from '../common';
import {
  BreachProtocolFragment,
  BreachProtocolFragmentBoundingBox,
  BreachProtocolFragmentResult,
} from './base';

class BufferSizeControlGroup {
  /** Thickness of control group in pixels. */
  // 7 pixels is max on lowest resolution, anything more will
  // interfere with boxes, and control group will always fail.
  private readonly size = 7;

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

export class BreachProtocolBufferSizeFragment<C> extends BreachProtocolFragment<
  BufferSize,
  Buffer,
  C
> {
  private readonly controlGroups = [
    // Buffer boxes.
    new BufferSizeControlGroup(0.12, 0.22, 255),
    // End of fragment.
    new BufferSizeControlGroup(0.7, 1, 0),
  ];

  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(0.8, 0.225);

  readonly boundingBox = this.getFragmentBoundingBox();

  readonly fragment = this.container.preprocess(this.boundingBox);

  /** Percentage that padding in buffer box takes. */
  private readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  private readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  private readonly gap = 0.00546;

  private static cachedThreshold: number = null;

  isValid(n: number) {
    return Number.isInteger(n) && n >= BUFFER_SIZE_MIN && n <= BUFFER_SIZE_MAX;
  }

  private async checkControlGroupsForThreshold(threshold: number) {
    const fragment = this.container.threshold(this.fragment, threshold);
    const rawBuffer = await this.container.toRawBuffer(fragment);

    return this.controlGroups.map((cg) =>
      cg.verify(rawBuffer, this.boundingBox.width)
    ) as [boolean, boolean];
  }

  // Run binary search and check control groups to narrow
  // correct result. Since thresholds only depend on gamma,
  // values below 128 are exluded to speed up search(lowest
  // gamma 0.5 require ~160 threshold).
  private async findThreshold() {
    const base = 128;
    let start = 0;
    let end = base - 1;
    let i = 0;

    do {
      let m = Math.ceil((start + end) / 2);
      const threshold = m + base;
      const [cg1, cg2] = await this.checkControlGroupsForThreshold(threshold);

      if (cg1 && cg2) {
        return threshold;
      }

      if (!cg1) {
        // First control group has some black pixels, threshold is too high.
        end = m - 1;
      } else if (!cg2) {
        // Second control group has some white pixels, threshold is too low.
        start = m + 1;
      }
    } while (i++ < Math.log2(base) + 1);

    return null;
  }

  async recognize(
    threshold = BreachProtocolBufferSizeFragment.cachedThreshold
  ): Promise<BreachProtocolBufferSizeFragmentResult<C>> {
    const newThreshold = threshold ?? (await this.findThreshold());
    const fragment = this.container.threshold(this.fragment, newThreshold);
    const rawBuffer = await this.container.toRawBuffer(fragment);
    const bufferSize = this.getBufferSizeFromPixels(rawBuffer);
    const result = new BreachProtocolFragmentResult(
      this.id,
      rawBuffer,
      this.boundingBox,
      bufferSize,
      fragment
    ) as BreachProtocolBufferSizeFragmentResult<C>;

    if (!this.isValid(bufferSize)) {
      // In rare cases where given value is wrong, repeat with
      // binary search. For example when user changes gamma mid
      // game, saved value will be wrong. This allows to recalibrate
      // threshold on the fly.
      // One side effect of this behaviour is that --threshold-buffer-size
      // flag is quite useless, because even it fails, fallback will be used.
      if (threshold !== null) {
        return this.recognize(null);
      }

      throw new BreachProtocolValidationError(t`BUFFER_SIZE_INVALID`, result);
    }

    // Cache valid threshold to limit ammount of computation required on following BPs.
    BreachProtocolBufferSizeFragment.cachedThreshold = newThreshold;

    return result;
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

  private getBufferSizeFromPixels(pixels: Buffer) {
    const { width, outerWidth } = this.boundingBox;
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
