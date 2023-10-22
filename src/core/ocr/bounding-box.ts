export class BoudingBox {
  /** Expected aspect ratio of breach protocol. */
  static readonly ASPECT_RATIO = 16 / 9;

  private readonly ratio =
    this.getAspectRatio(this.x, this.y) / BoudingBox.ASPECT_RATIO;

  /** Width of the breach protocol. */
  readonly width = this.ratio > 1 ? this.y * BoudingBox.ASPECT_RATIO : this.x;

  /** Height of the breach protocol. */
  readonly height = this.ratio < 1 ? this.x / BoudingBox.ASPECT_RATIO : this.y;

  /** Distance in pixels from left edge to breach protocol. */
  readonly left = (this.x - this.width) / 2;

  /** Distance in pixels from top edge to breach protocol. */
  readonly top = (this.y - this.height) / 2;

  /** Aspect ratio of breach protocol. */
  readonly aspectRatio = this.getAspectRatio(this.width, this.height);

  constructor(public readonly x: number, public readonly y: number) {}

  private getAspectRatio(x: number, y: number) {
    // WXGA, very close to 16:9
    // https://en.wikipedia.org/wiki/Graphics_display_resolution#WXGA
    if (y === 768 && (x === 1366 || x === 1360)) {
      return BoudingBox.ASPECT_RATIO;
    }

    return x / y;
  }
}
