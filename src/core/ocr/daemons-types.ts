import {
  BreachProtocolLanguages,
  DaemonId,
  DAEMON_UNKNOWN,
  langData,
  Point,
  similarity,
  unique,
} from '@/common';
import { TypesRawData } from '../common';
import {
  BreachProtocolFragmentResult,
  BreachProtocolFragmentStatus,
  BreachProtocolOCRFragment,
} from './base';
import { ImageContainer } from './image-container';
import { BreachProtocolRecognizer } from './recognizer';

export type BreachProtocolTypesFragmentResult = BreachProtocolFragmentResult<
  TypesRawData,
  'types'
>;

export class BreachProtocolTypesFragment<
  TImage
> extends BreachProtocolOCRFragment<TypesRawData, TImage, 'types'> {
  readonly id = 'types';
  readonly p1 = new Point(0.679, 0.312);
  readonly p2 = new Point(0.963, 0.598);

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.processTypesFragment(
    this.boundingBox
  );

  readonly thresholds = new Map([
    [1080, 120],
    [1440, 90],
    [2160, 30],
  ]);

  /** Dictionary for daemon types. */
  private static daemonDict: Map<string, DaemonId> = null;

  /** Language of current dictionary. */
  private static daemonDictLang: BreachProtocolLanguages = null;

  constructor(
    container: ImageContainer<TImage>,
    private readonly recognizer: BreachProtocolRecognizer
  ) {
    super(container);

    this.setDaemonDict();
  }

  private setDaemonDict() {
    if (this.recognizer.lang !== BreachProtocolTypesFragment.daemonDictLang) {
      const { lang } = this.recognizer;
      const { daemons } = langData[lang];
      const entries = daemons.map((d) => [d.value, d.id] as const);

      BreachProtocolTypesFragment.daemonDict = new Map(entries);
      BreachProtocolTypesFragment.daemonDictLang = lang;
    }
  }

  getStatus(rawData: TypesRawData) {
    const { length } = rawData.filter(unique);
    const hasDuplicates = length !== rawData.length;
    const hasUnknown = rawData.some((t) => t === DAEMON_UNKNOWN);

    if (hasDuplicates || hasUnknown) {
      return BreachProtocolFragmentStatus.InvalidSymbols;
    }

    if (!rawData.length || rawData.length > 5) {
      return BreachProtocolFragmentStatus.InvalidSize;
    }

    return BreachProtocolFragmentStatus.Valid;
  }

  async recognize(fixedThreshold?: number) {
    const threshold = fixedThreshold ?? this.getThreshold();
    const { buffer, source } = await this.ocr(threshold);
    const lines = this.getLines(source.text);
    const rawData = this.getRawData(lines);

    return this.getFragmentResult(source, rawData, buffer, threshold);
  }

  protected async ocr(threshold: number) {
    const fragment = this.container.threshold(this.fragment, threshold, false);
    const buffer = await this.container.toBuffer(fragment);
    const { lines, text } = await this.recognizer.recognizeText(buffer);
    const boxes = lines.flatMap((code) => code.map((w) => w.bbox));
    const source = { boxes, text };

    return { buffer, source };
  }

  protected getRawData(lines: string[]) {
    const keys = Array.from(BreachProtocolTypesFragment.daemonDict.keys());

    return lines.map((t) => {
      const similarities = keys.map((k) => similarity(t, k));
      const max = Math.max(...similarities);

      return max > 0.9
        ? BreachProtocolTypesFragment.daemonDict.get(
            keys[similarities.indexOf(max)]
          )
        : DAEMON_UNKNOWN;
    });
  }
}
