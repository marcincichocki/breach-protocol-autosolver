import { Point, similarity, unique } from '@/common';
import { DaemonId, TypesRawData } from '../../common';
import {
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_ICEPICK,
} from '../../daemons';
import { BreachProtocolLanguage, daemonsI18n } from '../../daemons-i18n';
import { ImageContainer } from '../image-container';
import {
  BreachProtocolFragmentOptions,
  BreachProtocolFragmentResult,
  BreachProtocolFragmentStatus,
  BreachProtocolOCRFragment,
} from './base';

export type BreachProtocolTypesFragmentResult = BreachProtocolFragmentResult<
  TypesRawData,
  'types'
>;

export class BreachProtocolTypesFragment<
  TImage
> extends BreachProtocolOCRFragment<TypesRawData, TImage, 'types'> {
  readonly id = 'types';
  readonly p1 = new Point(0.679, 0.312);
  readonly p2 = new Point(
    0.963,
    this.options.extendedDaemonsAndTypesRecognitionRange ? 0.847 : 0.6
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.processTypesFragment(
    this.boundingBox
  );

  readonly thresholds = new Map([
    [1080, 100],
    [1440, 55],
    [2160, 30],
  ]);

  /** Dictionary for daemon types. */
  private static daemonDict: Record<string, DaemonId> = null;

  /** Language of current dictionary. */
  private static daemonDictLang: BreachProtocolLanguage = null;

  private static minAcceptableSimilarity = 0.85;

  // Some non latin languages contain latin characters in daemon names.
  // This can cause invalid characters to be recognized by tesseract.
  // Extending unicharset is not possible on fast integer lstm models(per docs) and
  // using 2 langs at once will cause performance issues.
  // Training models from scratch is out of the question.
  // Therefore simple map with edge cases is sufficient to work around this problem,
  // as sequence based algorithm approach doesn't work well for short strings.
  private static edgeCases = new Map<string, DaemonId>([
    ['1픽', DAEMON_ICEPICK],
    ['منجم بيانات 1لا', DAEMON_DATAMINE_V1],
    ['منجم بيانات 2لا', DAEMON_DATAMINE_V2],
    ['منجم بيانات 3لا', DAEMON_DATAMINE_V3],
    ['منجم_بيانات_1لا', DAEMON_DATAMINE_V1],
    ['منجم_بيانات_2لا', DAEMON_DATAMINE_V2],
    ['منجم_بيانات_3لا', DAEMON_DATAMINE_V3],
    ['عنجم بيانات 1لا', DAEMON_DATAMINE_V1],
    ['عنجم بيانات 2لا', DAEMON_DATAMINE_V2],
    ['عنجم بيانات 3لا', DAEMON_DATAMINE_V3],
  ]);

  constructor(
    container: ImageContainer<TImage>,
    options: BreachProtocolFragmentOptions
  ) {
    super(container, options);

    this.setDaemonDict();
  }

  private setDaemonDict() {
    if (
      this.options.recognizer.lang !==
      BreachProtocolTypesFragment.daemonDictLang
    ) {
      const { lang } = this.options.recognizer;
      const entries = Object.entries(daemonsI18n[lang]).map(
        ([k, v]: [DaemonId, string]) => [v, k] as const
      );

      BreachProtocolTypesFragment.daemonDict = Object.fromEntries(entries);
      BreachProtocolTypesFragment.daemonDictLang = lang;
    }
  }

  getStatus(rawData: TypesRawData) {
    const { length } = rawData.filter(unique);
    const hasDuplicates = length !== rawData.length;
    const hasUnknown = rawData.some((t) => !t);

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
    const { lines, text } = await this.options.recognizer.recognizeText(buffer);
    const boxes = lines.flatMap((code) => code.map((w) => w.bbox));
    const source = { boxes, text };

    return { buffer, source };
  }

  protected getRawData(lines: string[]) {
    const keys = Object.keys(BreachProtocolTypesFragment.daemonDict);

    return lines.map((t) => {
      if (BreachProtocolTypesFragment.edgeCases.has(t)) {
        return BreachProtocolTypesFragment.edgeCases.get(t);
      }

      const similarities = keys.map((k) => similarity(t, k));
      const max = Math.max(...similarities);

      if (max > BreachProtocolTypesFragment.minAcceptableSimilarity) {
        const index = similarities.indexOf(max);
        const value = keys[index];
        // Remove used value as it can not appear twice.
        keys.splice(index, 1);

        return BreachProtocolTypesFragment.daemonDict[value];
      }

      return null;
    });
  }
}
