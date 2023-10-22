import { BoudingBox } from './bounding-box';

describe('BoudingBox', () => {
  const horizontal = [
    [1024, 768],
    [1024, 1280],
    [1152, 864],
    [1280, 768],
    [1280, 800],
    [1280, 960],
    [1280, 1024],
    [1600, 1024],
    [1600, 1200],
    [1680, 1050],
    [1920, 1200],
    [1920, 1440],
  ];

  const vertical = [
    [2560, 1080],
    [3440, 1440],
    [3840, 1080],
  ];

  const regular = [
    [1280, 720],
    [1360, 768],
    [1366, 768],
    [1600, 900],
    [1920, 1080],
    [2560, 1440],
    [3840, 2160],
  ];

  it.each(horizontal)('should crop horizontal black bars(%ix%i)', (x, y) => {
    const box = new BoudingBox(x, y);

    expect(box.aspectRatio).toBe(BoudingBox.ASPECT_RATIO);
    expect(box.width).toBe(x);
    expect(box.height).toBe(y - 2 * box.top);
    expect(box.left).toBe(0);
    expect(box.top).toBe((y - box.height) / 2);
  });

  it.each(vertical)('should crop vertical black bars(%ix%i)', (x, y) => {
    const box = new BoudingBox(x, y);

    expect(box.aspectRatio).toBe(BoudingBox.ASPECT_RATIO);
    expect(box.width).toBe(x - 2 * box.left);
    expect(box.height).toBe(y);
    expect(box.left).toBe((x - box.width) / 2);
    expect(box.top).toBe(0);
  });

  it.each(regular)('should not crop 16:9 resolutions(%ix%i)', (x, y) => {
    const box = new BoudingBox(x, y);

    expect(box.aspectRatio).toBe(BoudingBox.ASPECT_RATIO);
    expect(box.width).toBe(x);
    expect(box.height).toBe(y);
    expect(box.left).toBe(0);
    expect(box.top).toBe(0);
  });
});
