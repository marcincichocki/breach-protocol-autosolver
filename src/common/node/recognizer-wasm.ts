import {
  BreachProtocolLanguage,
  BreachProtocolRecognizer,
  daemonsI18n,
  HEX_CODES,
} from '@/core';
import {
  createScheduler,
  createWorker,
  Page,
  RecognizeResult,
  Scheduler,
  Worker,
  WorkerParams,
} from 'tesseract.js';
import { unique } from '../util';

export class WasmBreachProtocolRecognizer implements BreachProtocolRecognizer {
  constructor(public readonly lang: BreachProtocolLanguage) {
    /**
     * Initializing workers takes a lot of time. Loading them every time
     * when class is instantiated is a big performance bottleneck.
     * Instead call {@link WasmBreachProtocolRecognizer.init}
     * during bootstrap to init tesseract workers and
     * {@link WasmBreachProtocolRecognizer.terminate} during exit
     * to terminated them.
     */
    if (!WasmBreachProtocolRecognizer.initialized) {
      throw new Error(
        'Recognizer is not initialized, call WasmBreachProtocolRecognizer.init first.'
      );
    }
  }

  async recognizeText(image: Buffer) {
    if (this.lang !== WasmBreachProtocolRecognizer.loadedLang) {
      await WasmBreachProtocolRecognizer.textWorker.terminate();

      const worker = await WasmBreachProtocolRecognizer.initTextWorker(
        this.lang
      );

      WasmBreachProtocolRecognizer.textWorker = worker;
      WasmBreachProtocolRecognizer.loadedLang = this.lang;
    }

    const { data } = await WasmBreachProtocolRecognizer.textWorker.recognize(
      image
    );

    return this.toResult(data);
  }

  async recognizeCode(image: Buffer) {
    const { data } = await this.scheduleRecognizeJob(image);

    return this.toResult(data);
  }

  private toResult({ lines, text }: Page) {
    return { lines: lines.map(({ words }) => words), text };
  }

  private scheduleRecognizeJob(image: Buffer) {
    return WasmBreachProtocolRecognizer.scheduler.addJob(
      'recognize',
      image
    ) as Promise<RecognizeResult>;
  }

  private static async initWorker(
    lang: string,
    params?: Partial<WorkerParams>
  ) {
    const worker = createWorker({
      cacheMethod: 'none',
      langPath: this.langPath,
    });

    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    if (params) {
      await worker.setParameters(params);
    }

    return worker;
  }

  private static initCodeWorker() {
    return this.initWorker('BreachProtocol', {
      tessedit_char_whitelist: HEX_CODES.join(''),
    });
  }

  private static initTextWorker(lang: BreachProtocolLanguage) {
    return this.initWorker(lang, {
      tessedit_char_whitelist: this.getLangWhitelist(lang),
    });
  }

  private static getLangWhitelist(lang: BreachProtocolLanguage) {
    return Object.values(daemonsI18n[lang])
      .flatMap((d) => d.split(''))
      .filter(unique)
      .join('');
  }

  /**
   * Load and initialize workers with correct tessdata.
   *
   * @param langPath Path to directory with tessdata.
   * @param gameLang Game language to initialize with.
   */
  static async init(langPath: string, gameLang: BreachProtocolLanguage) {
    if (this.initialized) {
      throw new Error('Recognizer can be initialized only once.');
    }

    this.langPath = langPath;

    const w1 = await this.initCodeWorker();
    const w2 = await this.initCodeWorker();
    const textWorker = await this.initTextWorker(gameLang);

    const scheduler = createScheduler();

    scheduler.addWorker(w1);
    scheduler.addWorker(w2);

    this.textWorker = textWorker;
    this.scheduler = scheduler;
    this.loadedLang = gameLang;
    this.initialized = true;
  }

  /** Terminate tesseract workers. */
  static async terminate() {
    if (!this.initialized) {
      throw new Error('Recognizer is not initialized.');
    }

    await this.textWorker.terminate();
    await this.scheduler.terminate();
  }

  /** Language of text worker that is currently loaded. */
  private static loadedLang: BreachProtocolLanguage = null;

  /** Directory with tessdata */
  private static langPath: string = null;

  /** Scheduler for code workers. */
  private static scheduler: Scheduler;

  private static textWorker: Worker;

  /** Whether recognizer was initialized. */
  private static initialized = false;
}
