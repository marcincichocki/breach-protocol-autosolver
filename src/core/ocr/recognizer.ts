interface BreachProtocolRecognitionResult {
  text: string;
  boxes: Tesseract.Bbox[];
}

export abstract class BreachProtocolRecognizer {
  abstract recognize(image: Buffer): Promise<BreachProtocolRecognitionResult>;
}
