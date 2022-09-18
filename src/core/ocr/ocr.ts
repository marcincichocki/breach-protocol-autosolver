import { Point } from '@/common';
import {
  BreachProtocolRawData,
  COLS,
  cross,
  generateSquareMap,
  isGridFragment,
  ROWS,
} from '../common';
import {
  BreachProtocolBufferSizeFragment,
  BreachProtocolBufferSizeTrimFragment,
  BreachProtocolDaemonsFragment,
  BreachProtocolFragmentOptions,
  BreachProtocolFragmentResults,
  BreachProtocolGridFragment,
  BreachProtocolTypesFragment,
  FragmentId,
} from './fragments';
import { ImageContainer } from './image-container';
import { BreachProtocolRecognizer } from './recognizer';

export class BreachProtocolRecognitionResult {
  public readonly results = this.unsafeResults.filter(
    Boolean
  ) as BreachProtocolFragmentResults;

  readonly positionSquareMap = this.getPositionSquareMap();

  readonly rawData = this.reduceToRawData();

  readonly isValid = this.results
    // daemon types can be undedected
    .filter((r) => r.id !== 'types')
    .every((r) => r.isValid);

  constructor(private readonly unsafeResults: BreachProtocolFragmentResults) {}

  private reduceToRawData(): BreachProtocolRawData {
    return this.results.reduce(
      (result, { id, rawData }) => ({
        ...result,
        [id]: rawData,
      }),
      {} as BreachProtocolRawData
    );
  }

  private getSquares(length: number) {
    const size = Math.sqrt(length);
    const rows = ROWS.slice(0, size);
    const cols = COLS.slice(0, size);

    return cross(rows, cols);
  }

  private getPositionSquareMap() {
    const grid = this.results.find(isGridFragment);
    const { top, left } = grid.boundingBox;
    const { boxes } = grid.source;
    const squares = this.getSquares(boxes.length);

    return generateSquareMap(squares, (s, i) => {
      const { x0, y0, x1, y1 } = boxes[i];
      const x = Math.round((x0 + x1) / 2);
      const y = Math.round((y0 + y1) / 2);

      return new Point(x + left, y + top);
    });
  }
}

interface BreachProtocolOCROptions {
  thresholds?: Partial<Record<FragmentId, number>>;
  experimentalBufferSizeRecognition?: boolean;
  filterRecognizerResults?: boolean;
  skipTypesFragment?: boolean;
  extendedDaemonsAndTypesRecognitionRange?: boolean;
  extendedBufferSizeRecognitionRange?: boolean;
}

export async function breachProtocolOCR<TImage>(
  container: ImageContainer<TImage>,
  recognizer: BreachProtocolRecognizer,
  {
    thresholds,
    experimentalBufferSizeRecognition,
    filterRecognizerResults,
    skipTypesFragment,
    extendedBufferSizeRecognitionRange,
    extendedDaemonsAndTypesRecognitionRange,
  }: BreachProtocolOCROptions
) {
  const options: BreachProtocolFragmentOptions = {
    recognizer,
    filterRecognizerResults,
    extendedBufferSizeRecognitionRange,
    extendedDaemonsAndTypesRecognitionRange,
  };
  const gridFragment = new BreachProtocolGridFragment(container, options);
  const daemonsFragment = new BreachProtocolDaemonsFragment(container, options);
  const bufferSizeFragment = experimentalBufferSizeRecognition
    ? new BreachProtocolBufferSizeTrimFragment(container, options)
    : new BreachProtocolBufferSizeFragment(container, options);
  const typesFragment = skipTypesFragment
    ? null
    : new BreachProtocolTypesFragment(container, options);

  const results = await Promise.all([
    gridFragment.recognize(thresholds?.grid),
    daemonsFragment.recognize(thresholds?.daemons),
    bufferSizeFragment.recognize(thresholds?.bufferSize),
    typesFragment?.recognize(thresholds?.types),
  ]);

  return new BreachProtocolRecognitionResult(results);
}
