export interface BreachProtocolRecognizerBox {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

export interface BreachProtocolRecognizerCode {
  text: string;
  bbox: BreachProtocolRecognizerBox;
}

export interface BreachProtocolRecognizerResult {
  lines: BreachProtocolRecognizerCode[][];
}

export interface BreachProtocolRecognizer {
  recognize(image: Buffer): Promise<BreachProtocolRecognizerResult>;
}
