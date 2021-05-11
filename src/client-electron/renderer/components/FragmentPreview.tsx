import { BreachProtocolSource } from '@/core';
import { FC, useEffect, useRef } from 'react';

function getStrokeRectCords(
  box: Tesseract.Bbox,
  scale: number,
  lineWidth: number
) {
  const x = box.x0 * scale - lineWidth / 2;
  const y = box.y0 * scale - lineWidth / 2;
  const width = (box.x1 - box.x0) * scale + lineWidth;
  const height = (box.y1 - box.y0) * scale + lineWidth;

  return { x, y, width, height };
}

function renderFragmentToCanvas(
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D,
  fragment: string,
  boxes: Tesseract.Bbox[],
  showBoxes: boolean
) {
  const image = new Image();
  // TODO: use format flag?
  image.src = `data:image/png;base64,${fragment}`;

  image.onload = () => {
    const base = 500;
    const scale = base / image.width;
    const lineWidth = 2;
    canvas.width = base;
    canvas.height = image.height * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);

    if (!boxes || !showBoxes) return;

    for (const box of boxes) {
      context.strokeStyle = 'red';
      context.lineWidth = lineWidth;

      const { x, y, width, height } = getStrokeRectCords(box, scale, lineWidth);

      context.strokeRect(x, y, width, height);
    }
  };
}

interface FragmentPreviewProps {
  image: string;
  boxes: Tesseract.Bbox[];
  showBoxes: boolean;
}

export const FragmentPreview: FC<FragmentPreviewProps> = ({
  image,
  boxes,
  showBoxes,
}) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    const context = canvas.getContext('2d');

    renderFragmentToCanvas(canvas, context, image, boxes, showBoxes);
  }, [image, showBoxes]);

  return <canvas ref={ref} style={{ alignSelf: 'flex-start' }} />;
};
