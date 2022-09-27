import { BreachProtocolLanguage } from '../daemons-i18n';

export interface BreachProtocolRecognizerBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BreachProtocolRecognizerWord {
  text: string;
  bbox: BreachProtocolRecognizerBox;
}

export interface BreachProtocolRecognizerResult {
  text: string;
  lines: BreachProtocolRecognizerWord[][];
}

export interface BreachProtocolRecognizer {
  /** Current language. */
  lang: BreachProtocolLanguage;

  /** Recognize BP codes. */
  recognizeCode(image: string): Promise<BreachProtocolRecognizerResult>;

  /** Recognize daemon type. */
  recognizeText(image: string): Promise<BreachProtocolRecognizerResult>;
}
