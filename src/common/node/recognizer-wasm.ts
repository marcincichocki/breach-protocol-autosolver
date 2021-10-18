import { BreachProtocolRecognizer, HEX_CODES } from '@/core';
import Tesseract, { createScheduler, createWorker } from 'tesseract.js';
import { BreachProtocolLanguages } from '../types';

export class WasmBreachProtocolRecognizer implements BreachProtocolRecognizer {
  constructor(public readonly lang: BreachProtocolLanguages) {
    /**
     * Initializing workers takes a lot of time. Loading them every time
     * when class is instantiated is a big performance bottleneck.
     * Instead call {@link WasmBreachProtocolRecognizer.init}
     * during bootstrap to init tesseract workers and
     * {@link WasmBreachProtocolRecognizer.terminate} during exit
     * to terminated them.
     */
    if (!WasmBreachProtocolRecognizer.scheduler) {
      throw new Error('Scheduler is not initialized!');
    }
  }

  async recognizeText(image: Buffer) {
    if (this.lang !== WasmBreachProtocolRecognizer.loadedLang) {
      console.log('initializing text worker again because lang is different');

      await WasmBreachProtocolRecognizer.textWorker.terminate();
      WasmBreachProtocolRecognizer.textWorker =
        await WasmBreachProtocolRecognizer.initTextWorker(this.lang);

      WasmBreachProtocolRecognizer.loadedLang = this.lang;
    }
    console.time();
    const {
      data: { text, lines },
    } = await WasmBreachProtocolRecognizer.textWorker.recognize(image);

    console.timeEnd();

    return { lines: lines.map((l) => l.words), text };
  }

  async recognizeCode(image: Buffer) {
    const {
      data: { lines, text },
    } = await this.scheduleRecognizeJob(image);

    return { lines: lines.map(({ words }) => words), text };
  }

  private scheduleRecognizeJob(image: Buffer) {
    return WasmBreachProtocolRecognizer.scheduler.addJob(
      'recognize',
      image
    ) as Promise<Tesseract.RecognizeResult>;
  }

  private static async initWorker(
    lang: string,
    options?: Partial<Tesseract.WorkerOptions>
  ) {
    const worker = createWorker({
      ...options,
      cacheMethod: 'none',
      langPath: this.langPath,
    });

    await worker.load();
    await worker.loadLanguage(lang);
    await worker.initialize(lang);

    return worker;
  }

  private static async initCodeWorker() {
    const worker = await this.initWorker('BreachProtocol', { gzip: false });

    await worker.setParameters({
      tessedit_char_whitelist: HEX_CODES.join(''),
    });

    return worker;
  }

  private static async initTextWorker(lang: string) {
    const worker = await this.initWorker(lang);

    // TODO: get daemon data and set as whitelist

    return worker;
  }

  /**
   * Initialize tesseract.js scheduler.
   *
   * @param langPath Path to folder where BreachProtocol.traineddata can be found. Relative to process.cwd() or absolute.
   */
  static async init(langPath: string, gameLang: BreachProtocolLanguages) {
    if (this.scheduler) {
      throw new Error('Scheduler is alredy initialized.');
    }

    this.langPath = langPath;

    const w1 = await this.initCodeWorker();
    const w2 = await this.initCodeWorker();
    const textWorker = await this.initTextWorker(gameLang);

    const scheduler = createScheduler();

    scheduler.addWorker(w1);
    scheduler.addWorker(w2);

    this.loadedLang = gameLang;
    this.textWorker = textWorker;
    this.scheduler = scheduler;
  }

  /**
   * Terminate tesseract.js scheduler.
   */
  static async terminate() {
    if (!this.scheduler) {
      throw new Error('Scheduler is not initialized.');
    }

    await this.textWorker.terminate();
    await this.scheduler.terminate();
  }

  static loadedLang: BreachProtocolLanguages = null;

  private static langPath: string = null;

  private static scheduler: Tesseract.Scheduler;
  private static textWorker: Tesseract.Worker;
}
