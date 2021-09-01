import { HEX_NUMBERS } from '@/core';
import { BreachProtocolRecognizer } from '@/core/ocr/recognizer';
import { Config, recognize } from 'node-tesseract-ocr';

export class NativeBreachProtocolRecognizer extends BreachProtocolRecognizer {
  private config: Config = {
    'tessdata-dir': './resources',
    lang: 'BreachProtocol',
    tessedit_char_whitelist: HEX_NUMBERS.join(''),
    psm: 6,
    page_separator: '',
  };

  async recognize(image: Buffer) {
    const text = await recognize(image, this.config);
    const boxes: Tesseract.Bbox[] = [];

    return { text, boxes };
  }
}
