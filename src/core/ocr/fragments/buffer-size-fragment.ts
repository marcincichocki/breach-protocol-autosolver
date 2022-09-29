import { Point } from '@/common';
import { BufferSize, BUFFER_SIZE_MAX, BUFFER_SIZE_MIN } from '../../common';
import { BreachProtocolFragment, BreachProtocolFragmentResult } from './base';
import { FragmentId, FragmentStatus } from './fragment';

export abstract class BreachProtocolBufferSizeBase<
  TImage
> extends BreachProtocolFragment<BufferSize, TImage, FragmentId.BufferSize> {
  readonly id = FragmentId.BufferSize;

  readonly p1 = new Point(0.42, 0.167);
  readonly p2 = new Point(
    this.options.extendedBufferSizeRecognitionRange ? 0.863 : 0.8,
    0.225
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.toFragmentContainer({
    boundingBox: this.boundingBox,
    colors: 2,
  });

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
      return FragmentStatus.InvalidSize;
    }

    return FragmentStatus.Valid;
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
  verify(data: Uint8Array, rowLength: number) {
    const startIndex = Math.round(this.start * rowLength);
    const endIndex = Math.round(this.end * rowLength);

    return this.getLineIndexes(rowLength)
      .map((n) => data.subarray(startIndex + n, endIndex + n))
      .every((line) => line.every((p) => p === this.value));
  }
}

export type BreachProtocolBufferSizeFragmentResult =
  BreachProtocolFragmentResult<BufferSize, FragmentId.BufferSize>;

export class BreachProtocolBufferSizeFragment<
  TImage
> extends BreachProtocolBufferSizeBase<TImage> {
  private readonly controlGroups = [
    // Buffer boxes.
    new BufferSizeControlGroup(
      this.options.extendedBufferSizeRecognitionRange ? 0.102 : 0.12,
      this.options.extendedBufferSizeRecognitionRange ? 0.189 : 0.22,
      255
    ),
    // End of fragment.
    new BufferSizeControlGroup(
      this.options.extendedBufferSizeRecognitionRange ? 0.9 : 0.7,
      1,
      0
    ),
  ];

  private static cachedThreshold: number = null;

  private async checkControlGroupsForThreshold(threshold: number) {
    const data = await this.fragment.clone().threshold(threshold).toPixelData();

    return this.controlGroups.map((cg) =>
      cg.verify(data, this.boundingBox.width)
    ) as [boolean, boolean];
  }

  // Run binary search and check control groups to narrow
  // correct result. Since thresholds only depend on gamma,
  // values below 128 are excluded to speed up search(lowest
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
    const { uri } = await this.fragment.threshold(threshold).toBase64();
    const data = await this.fragment.toPixelData();
    const bufferSize = this.getBufferSizeFromPixels(data);

    if (this.getStatus(bufferSize) !== FragmentStatus.Valid) {
      // In rare cases where given value is wrong, repeat with
      // binary search. For example when user changes gamma mid
      // game, saved value will be wrong. This allows to re-calibrate
      // threshold on the fly.
      // One side effect of this behavior is that --threshold-buffer-size
      // flag is quite useless, because even it fails, fallback will be used.
      if (useFallback && fixedThreshold !== null) {
        return this.recognize(null);
      }
    }

    // Cache valid threshold to limit amount of computation required on following breach protocols.
    BreachProtocolBufferSizeFragment.cachedThreshold = threshold;

    return this.getFragmentResult(null, bufferSize, uri, threshold);
  }

  private verifyControlGroups(data: Uint8Array, length: number) {
    return this.controlGroups.every((cg) => cg.verify(data, length));
  }

  private getSizeOfBufferBox(data: Uint8Array, width: number) {
    const row = data.subarray(0, width);
    let size = 0;

    if (!this.verifyControlGroups(data, width)) {
      return 0;
    }

    for (let i = 0; i < row.length; i++) {
      if (row[i] === 255) {
        size += 1;
      }
    }

    return size;
  }

  private getBufferSizeFromPixels(data: Uint8Array) {
    const { width, innerWidth } = this.boundingBox;
    let size = this.getSizeOfBufferBox(data, width) / innerWidth;
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
  override readonly fragment = this.container.toFragmentContainer({
    boundingBox: this.boundingBox,
    flop: true,
  });

  // Ensure compatibility with current api.
  async recognize(
    threshold?: number
  ): Promise<BreachProtocolBufferSizeFragmentResult> {
    const { uri, dimensions } = await this.fragment.toBase64({ trim: true });
    const bufferSize = await this.getBufferSizeFromPixels(dimensions.width);

    return this.getFragmentResult(null, bufferSize, uri, null);
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
