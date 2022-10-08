import type { BreachProtocolRecognizerBox } from '@/core';
import { useEffect, useRef } from 'react';

function getStrokeRectCords(
  box: BreachProtocolRecognizerBox,
  scale: number,
  lineWidth: number
) {
  const x = box.x0 * scale - lineWidth / 2;
  const y = box.y0 * scale - lineWidth / 2;
  const width = (box.x1 - box.x0) * scale + lineWidth;
  const height = (box.y1 - box.y0) * scale + lineWidth;

  return { x, y, width, height };
}

function renderFragmentToCanvas({
  canvas,
  image,
  boxes,
  showBoxes,
}: FragmentPreviewProps & { canvas: HTMLCanvasElement }) {
  const imageEl = new Image();
  const context = canvas.getContext('2d');

  imageEl.onload = () => {
    const base = 600;
    const scale = base / imageEl.width;
    const lineWidth = 2;
    canvas.width = base;
    canvas.height = imageEl.height * scale;
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(imageEl, 0, 0, canvas.width, canvas.height);

    if (!boxes || !showBoxes) return;

    for (const box of boxes) {
      context.strokeStyle = 'red';
      context.lineWidth = lineWidth;

      const { x, y, width, height } = getStrokeRectCords(box, scale, lineWidth);

      context.strokeRect(x, y, width, height);
    }
  };

  imageEl.src = image;
}

interface FragmentPreviewProps {
  image: string;
  boxes: BreachProtocolRecognizerBox[];
  showBoxes: boolean;
}

export const FragmentPreview = (props: FragmentPreviewProps) => {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    renderFragmentToCanvas({
      ...props,
      canvas: ref.current,
    });
  }, [props.image, props.showBoxes]);

  return <canvas ref={ref} />;
};
