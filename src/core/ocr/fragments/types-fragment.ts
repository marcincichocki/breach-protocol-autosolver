import { Point, similarity, unique } from '@/common';
import {
  DAEMONS_SIZE_MAX,
  DAEMONS_SIZE_MIN,
  DaemonId,
  TypesRawData,
} from '../../common';
import { DAEMONS, LEGACY_DAEMONS } from '../../daemon-set';
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
  BreachProtocolOCRFragment,
} from './base';
import { FragmentId, FragmentStatus } from './fragment';

export type BreachProtocolTypesFragmentResult = BreachProtocolFragmentResult<
  TypesRawData,
  FragmentId.Types
>;

export class BreachProtocolTypesFragment<
  TImage
> extends BreachProtocolOCRFragment<TypesRawData, TImage, FragmentId.Types> {
  readonly id = FragmentId.Types;
  readonly p1 = new Point(0.664, 0.312);
  readonly p2 = new Point(
    0.963,
    this.options.extendedDaemonsAndTypesRecognitionRange ? 0.847 : 0.729
  );

  readonly boundingBox = this.getFragmentBoundingBox();

  protected readonly fragment = this.container.toFragmentContainer({
    boundingBox: this.boundingBox,
    colors: 2,
    channel: 'blue',
  });

  readonly thresholds = new Map([
    [1080, 100],
    [1440, 55],
    [2160, 30],
  ]);

  /** Dictionary for daemon types. */
  private static daemonDict: Record<string, DaemonId> = null;

  /** Language of current dictionary. */
  private static daemonDictLang: BreachProtocolLanguage = null;

  private static patch: string = null;

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
    const hasValidDictionary =
      this.options.recognizer.lang ===
      BreachProtocolTypesFragment.daemonDictLang;
    const hasValidPatch =
      this.options.patch === BreachProtocolTypesFragment.patch;

    if (!hasValidDictionary || !hasValidPatch) {
      const { recognizer, patch } = this.options;
      const { lang } = recognizer;
      const daemons = patch === '1.x' ? LEGACY_DAEMONS : DAEMONS;
      const daemonDictEntries = Object.entries(daemonsI18n[lang]) as [
        DaemonId,
        string
      ][];
      const entries = daemonDictEntries
        .filter(([daemonId]) => daemons.has(daemonId))
        .map(([daemonId, translation]) => [translation, daemonId] as const);

      BreachProtocolTypesFragment.daemonDict = Object.fromEntries(entries);
      BreachProtocolTypesFragment.daemonDictLang = lang;
      BreachProtocolTypesFragment.patch = patch;
    }
  }

  private isTypesSizeInvalid({ length }: TypesRawData) {
    return length < DAEMONS_SIZE_MIN || length > DAEMONS_SIZE_MAX;
  }

  getStatus(rawData: TypesRawData) {
    const { length } = rawData.filter(unique);
    const hasDuplicates = length !== rawData.length;
    const hasUnknown = rawData.some((t) => !t);

    if (hasDuplicates || hasUnknown) {
      return FragmentStatus.InvalidSymbols;
    }

    if (
      !this.options.extendedDaemonsAndTypesRecognitionRange &&
      this.isTypesSizeInvalid(rawData)
    ) {
      return FragmentStatus.InvalidSize;
    }

    return FragmentStatus.Valid;
  }

  async recognize(fixedThreshold?: number) {
    const threshold = fixedThreshold ?? this.getThreshold();
    const { uri, source } = await this.ocr(threshold);
    const lines = this.getLines(source.text);
    const rawData = this.getRawData(lines);

    return this.getFragmentResult(source, rawData, uri, threshold);
  }

  protected async ocr(threshold: number) {
    const { uri } = await this.fragment.threshold(threshold, false).toBase64();
    const { lines, text } = await this.options.recognizer.recognizeText(uri);
    const boxes = lines.flatMap((code) => code.map((w) => w.bbox));
    const source = { boxes, text };

    return { uri, source };
  }

  protected getRawData(lines: string[]) {
    const keys = Object.keys(BreachProtocolTypesFragment.daemonDict);

    return lines.map((t) => {
      if (
        this.options.patch === '1.x' &&
        BreachProtocolTypesFragment.edgeCases.has(t)
      ) {
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
