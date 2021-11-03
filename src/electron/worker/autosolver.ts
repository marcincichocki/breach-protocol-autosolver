import { BitMask, sleep, uniqueWith } from '@/common';
import {
  BreachProtocolKeyboardResolver,
  BreachProtocolMouseResolver,
  BreachProtocolResolver,
  BreachProtocolRobot,
  SharpImageContainer,
} from '@/common/node';
import { WasmBreachProtocolRecognizer } from '@/common/node/recognizer-wasm';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolRecognitionResult,
  BreachProtocolResultJSON,
  FragmentId,
  SequenceCompareStrategy,
} from '@/core';
import {
  AnalysisInput,
  AppSettings,
  BreachProtocolSolveProgress,
  BreachProtocolStatus,
  HistoryEntry,
} from '@/electron/common';
import { copyFile, remove } from 'fs-extra';
import { extname } from 'path';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { BreachProtocolSoundPlayer } from './sound-player';

export class BreachProtocolAutosolver {
  private readonly uuid = uuidv4();

  private fileName: string;

  private readonly startedAt = Date.now();
  private finishedAt: number;

  private recognitionResult: BreachProtocolRecognitionResult;
  private game: BreachProtocol;
  private result: BreachProtocolResultJSON;

  private status: BreachProtocolStatus = BreachProtocolStatus.Pending;
  private progress = new BitMask(BreachProtocolSolveProgress.Pending);

  private resolveDelay: Promise<unknown>;

  constructor(
    private readonly settings: AppSettings,
    private readonly robot: BreachProtocolRobot,
    private readonly player: BreachProtocolSoundPlayer,
    private readonly compareStrategy: SequenceCompareStrategy
  ) {}

  toHistoryEntry(): HistoryEntry {
    return {
      ...this.getBaseState(),
      ...this.getFragmentsValidState(),
      ...this.getSolutionFoundState(),
    };
  }

  dispose() {
    this.removeSourceImage();

    if (this.status === BreachProtocolStatus.Pending) {
      this.finishWithStatus(BreachProtocolStatus.Rejected);
    }
  }

  /** Get every unique result. */
  getResults() {
    return this.progress.has(BreachProtocolSolveProgress.FragmentsValid)
      ? this.game
          .solveAll()
          // Not every sequence have a solution.
          .filter(Boolean)
          .map((r) => r.toJSON())
          // This filter does not guarantee that shortest sequence will be preserved.
          .filter(uniqueWith((r) => r.sequence.parts.sort().join('')))
      : [];
  }

  async solve() {
    await this.analyze();
    await this.findSolution();
    await this.resolve();

    return this.toHistoryEntry();
  }

  async analyze(input?: AnalysisInput) {
    if (this.status !== BreachProtocolStatus.Pending) return;

    this.resolveDelay = this.getResolveDelayPromise();
    await this.player.play('start');

    this.fileName = await this.getBreachProtocolImage(input);
    this.recognitionResult = await this.recognize();

    if (!this.recognitionResult.isValid) {
      return this.rejectJob();
    }

    this.game = new BreachProtocol(
      this.recognitionResult.rawData,
      this.compareStrategy
    );

    this.progress.add(BreachProtocolSolveProgress.FragmentsValid);
  }

  async resolve(result?: BreachProtocolResultJSON) {
    if (this.status !== BreachProtocolStatus.Pending) return;

    if (result) {
      this.progress.add(BreachProtocolSolveProgress.SolutionFound);
      this.result = result;

      await this.robot.activateGameWindow();
    }

    const resolver = this.getResolver();

    await this.resolveDelay;
    await resolver.resolve(this.result.path);
    await resolver.stopAndExit(this.result.exitStrategy);

    this.resolveJob();
  }

  private async getBreachProtocolImage(input?: AnalysisInput) {
    if (input) {
      if (typeof input === 'string') {
        const ext = extname(input).substr(1);
        const dest = this.robot.getScreenShotPath(ext);

        await copyFile(input, dest);

        return dest;
      } else {
        // Only jpeg format is suported when analyzing BP from clipboard.
        const dest = this.robot.getScreenShotPath('jpg');
        const buffer = input instanceof Buffer ? input : Buffer.from(input);

        await sharp(buffer).toFormat('jpeg').toFile(dest);

        return dest;
      }
    }

    return this.robot.captureScreen();
  }

  private async findSolution() {
    if (this.status !== BreachProtocolStatus.Pending) return;

    this.result = this.game.solve().toJSON();

    if (!this.result) {
      return this.rejectJob();
    }

    this.progress.add(BreachProtocolSolveProgress.SolutionFound);
  }

  private getResolveDelayPromise() {
    return sleep(this.settings.resolveDelay);
  }

  private getResolver(): BreachProtocolResolver {
    return this.settings.outputDevice === 'keyboard'
      ? new BreachProtocolKeyboardResolver(this.robot, this.game.size)
      : new BreachProtocolMouseResolver(
          this.robot,
          this.recognitionResult.positionSquareMap
        );
  }

  private getBaseState() {
    return {
      version: VERSION,
      commitSha: GIT_COMMIT_SHA,
      uuid: this.uuid,
      status: this.status,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      fileName: this.fileName,
      fragments: this.recognitionResult.results,
      settings: this.settings,
    };
  }

  private getFragmentsValidState() {
    const bool = this.progress.has(BreachProtocolSolveProgress.FragmentsValid);

    return {
      sequences: bool ? this.game.sequences.map((s) => s.toJSON()) : null,
    };
  }

  private getSolutionFoundState() {
    const bool = this.progress.has(BreachProtocolSolveProgress.SolutionFound);

    return {
      result: bool ? this.result : null,
    };
  }

  private async rejectJob() {
    await this.player.play('error');

    return this.finishWithStatus(BreachProtocolStatus.Rejected);
  }

  private resolveJob() {
    if (!this.settings.preserveSourceOnSuccess) {
      this.removeSourceImage();
    }

    return this.finishWithStatus(BreachProtocolStatus.Resolved);
  }

  private finishWithStatus(status: BreachProtocolStatus) {
    this.status = status;
    this.finishedAt = Date.now();
  }

  private removeSourceImage() {
    remove(this.fileName);
    this.fileName = null;
  }

  private getFixedThresholds(): Record<FragmentId, number> {
    const {
      thresholdGrid,
      thresholdGridAuto,
      thresholdDaemons,
      thresholdDaemonsAuto,
      thresholdTypes,
      thresholdTypesAuto,
      thresholdBufferSize,
      thresholdBufferSizeAuto,
    } = this.settings;

    return {
      grid: thresholdGridAuto ? undefined : thresholdGrid,
      daemons: thresholdDaemonsAuto ? undefined : thresholdDaemons,
      types: thresholdTypesAuto ? undefined : thresholdTypes,
      bufferSize: thresholdBufferSizeAuto ? undefined : thresholdBufferSize,
    };
  }

  private async recognize() {
    const image = sharp(this.fileName);
    const {
      downscaleSource,
      experimentalBufferSizeRecognition,
      filterRecognizerResults,
      gameLang,
      skipTypesFragment,
    } = this.settings;
    const container = await SharpImageContainer.create(image, {
      downscaleSource,
    });
    const recognizer = new WasmBreachProtocolRecognizer(gameLang);

    return breachProtocolOCR(container, recognizer, {
      thresholds: this.getFixedThresholds(),
      experimentalBufferSizeRecognition,
      filterRecognizerResults,
      skipTypesFragment,
    });
  }
}
