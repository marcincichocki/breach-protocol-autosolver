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
  lines: BreachProtocolRecognizerWord[][];
}

export interface BreachProtocolRecognizer {
  recognize(image: Buffer): Promise<BreachProtocolRecognizerResult>;
}
