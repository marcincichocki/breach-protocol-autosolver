import { HEX_NUMBERS } from '@/core';
import { BreachProtocolRecognizer } from '@/core/ocr/recognizer';
import Tesseract, { createScheduler, createWorker } from 'tesseract.js';

export class WasmBreachProtocolRecognizer extends BreachProtocolRecognizer {
  constructor() {
    super();

    /**
     * Initializing workers takes a lot of time. Loading them every time
     * when class is instantiated is a big performance bottleneck.
     * Instead call {@link WasmBreachProtocolRecognizer.initScheduler}
     * during bootstrap to init tesseract workers and
     * {@link WasmBreachProtocolRecognizer.terminateScheduler} during exit
     * to terminated them.
     */
    if (!WasmBreachProtocolRecognizer.scheduler) {
      throw new Error('Scheduler is not initialized!');
    }
  }

  async recognize(image: Buffer) {
    const { data } = await (WasmBreachProtocolRecognizer.scheduler.addJob(
      'recognize',
      image
    ) as Promise<Tesseract.RecognizeResult>);

    const boxes = data.words.map((w) => w.bbox);

    return { text: data.text, boxes };
  }

  private static async initWorker(options: Partial<Tesseract.WorkerOptions>) {
    const lang = 'BreachProtocol';
    const w = createWorker(options);

    await w.load();
    await w.loadLanguage(lang);
    await w.initialize(lang);
    await w.setParameters({
      tessedit_char_whitelist: HEX_NUMBERS.join(''),
    });

    return w;
  }

  /**
   * Initialize tesseract.js scheduler.
   *
   * @param langPath Path to folder where BreachProtocol.traineddata can be found. Relative to process.cwd() or absolute.
   */
  static async initScheduler(langPath: string) {
    if (WasmBreachProtocolRecognizer.scheduler) {
      throw new Error('Scheduler is alredy initialized.');
    }

    const options: Partial<Tesseract.WorkerOptions> = {
      cacheMethod: 'none',
      gzip: false,
      langPath,
    };
    const w1 = await WasmBreachProtocolRecognizer.initWorker(options);
    const w2 = await WasmBreachProtocolRecognizer.initWorker(options);

    const scheduler = createScheduler();

    scheduler.addWorker(w1);
    scheduler.addWorker(w2);

    WasmBreachProtocolRecognizer.scheduler = scheduler;
  }

  /**
   * Terminate tesseract.js scheduler.
   */
  static terminateScheduler() {
    if (!WasmBreachProtocolRecognizer.scheduler) {
      throw new Error('Scheduler is not initialized.');
    }

    return WasmBreachProtocolRecognizer.scheduler.terminate();
  }

  private static scheduler: Tesseract.Scheduler;
}
