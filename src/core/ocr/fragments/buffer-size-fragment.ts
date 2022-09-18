import { Point } from '@/common';
import { BufferSize, BUFFER_SIZE_MAX, BUFFER_SIZE_MIN } from '../../common';
import {
  BreachProtocolFragment,
  BreachProtocolFragmentResult,
  BreachProtocolFragmentStatus,
} from './base';

export abstract class BreachProtocolBufferSizeBase<
  TImage
> extends BreachProtocolFragment<BufferSize, TImage, 'bufferSize'> {
  readonly id = 'bufferSize';

  readonly p1 = new Point(0.42, 0.167);

  readonly p2 = new Point(
    this.options.extendedBufferSizeRecognitionRange ? 0.863 : 0.8,
    0.225
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  readonly fragment = this.container.process(this.boundingBox);

  /** Percentage that padding in buffer box takes. */
  protected readonly padding = 0.00937;

  /** Percentage that buffer square takes. */
  protected readonly square = 0.0164;

  /** Percentage that gap between buffer squares takes. */
  protected readonly gap = 0.00546;

  getStatus(n: number) {
    if (
      !Number.isInteger(n) ||
      n < BUFFER_SIZE_MIN ||
      (!this.options.extendedBufferSizeRecognitionRange && n > BUFFER_SIZE_MAX)
    ) {
      return BreachProtocolFragmentStatus.InvalidSize;
    }

    return BreachProtocolFragmentStatus.Valid;
  }
}

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

export type BreachProtocolBufferSizeFragmentResult =
  BreachProtocolFragmentResult<BufferSize, 'bufferSize'>;

export class BreachProtocolBufferSizeFragment<
  TImage
> extends BreachProtocolBufferSizeBase<TImage> {
  private readonly controlGroups = [
    // Buffer boxes.
    new BufferSizeControlGroup(0.12, 0.22, 255),
    // End of fragment.
    new BufferSizeControlGroup(0.7, 1, 0),
  ];

  private static cachedThreshold: number = null;

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
    } while (++i < Math.log2(base));

    // No threshold found.
    return base;
  }

  async recognize(
    fixedThreshold = BreachProtocolBufferSizeFragment.cachedThreshold,
    useFallback = true
  ): Promise<BreachProtocolBufferSizeFragmentResult> {
    const threshold = fixedThreshold ?? (await this.findThreshold());
    const fragment = this.container.threshold(this.fragment, threshold);
    const buffer = await this.container.toBuffer(fragment);
    const rawBuffer = await this.container.toRawBuffer(fragment);
    const bufferSize = this.getBufferSizeFromPixels(rawBuffer);

    if (this.getStatus(bufferSize) !== BreachProtocolFragmentStatus.Valid) {
      // In rare cases where given value is wrong, repeat with
      // binary search. For example when user changes gamma mid
      // game, saved value will be wrong. This allows to recalibrate
      // threshold on the fly.
      // One side effect of this behaviour is that --threshold-buffer-size
      // flag is quite useless, because even it fails, fallback will be used.
      if (useFallback && fixedThreshold !== null) {
        return this.recognize(null);
      }
    }

    // Cache valid threshold to limit ammount of computation required on following BPs.
    BreachProtocolBufferSizeFragment.cachedThreshold = threshold;

    return this.getFragmentResult(null, bufferSize, buffer, threshold);
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
    const { width, innerWidth } = this.boundingBox;
    let size = this.getSizeOfBufferBox(pixels, width) / innerWidth;
    let bufferSize = 0;

    size -= 2 * this.padding;

    while (size > 0) {
      size -= this.square + this.gap;
      bufferSize += 1;
    }

    return bufferSize as BufferSize;
  }
}

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
