import { HEX_NUMBERS } from '@/core';
import { BreachProtocolRecognizer } from '@/core/ocr/recognizer';
import { Config, recognize } from 'node-tesseract-ocr';

export class NativeBreachProtocolRecognizer extends BreachProtocolRecognizer {
  private config: Config = {
    'tessdata-dir': './resources',
    lang: 'BreachProtocol',
    psm: 6,
    page_separator: '',
    tessedit_char_whitelist: HEX_NUMBERS.join(''),
    tessedit_create_tsv: '1',
  };

  async recognize(image: Buffer) {
    const tsv = await recognize(image, this.config);
    const rows = this.getRows(tsv);
    const boxes: Tesseract.Bbox[] = [];
    let text = '';
    let line = [];

    for (const row of rows) {
      const level = row[0];
      const [left, top, width, height, , word] = row.slice(6);
      const x0 = Number(left);
      const y0 = Number(top);
      const x1 = x0 + Number(width);
      const y1 = y0 + Number(height);

      if (level === '5') {
        line.push(word);
        boxes.push({ x0, y0, x1, y1 });
      } else {
        text += line.join(' ') + '\n';
        line = [];
      }
    }

    return { text, boxes };
  }

  private getRows(tsv: string) {
    return tsv
      .split('\n')
      .filter((l) => l.startsWith('4') || l.startsWith('5'))
      .map((l) => l.split(/\s+/));
  }
}
