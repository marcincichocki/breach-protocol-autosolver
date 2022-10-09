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
  BreachProtocolRawData,
  BreachProtocolRecognitionResult,
  BreachProtocolResultJSON,
  BufferSize,
} from '@/core';
import { HierarchyProvider } from '@/core/solver/hierarchy/hierarchy-provider';
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
  // This must be null, as undefined is not a valid JSON value, and it will be
  // serialized before autosolver job resolves or rejects.
  private finishedAt: number = null;

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
    private readonly hierarchyProvider: HierarchyProvider<BreachProtocolRawData>
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
          .filter(uniqueWith((r) => r.resolvedSequence.parts.sort().join('')))
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

    const rawData = this.getNormalizedRawData(this.recognitionResult);

    this.game = new BreachProtocol(rawData, {
      strategy: this.settings.strategy,
      hierarchyProvider: this.hierarchyProvider,
    });

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

  private getNormalizedRawData({ rawData }: BreachProtocolRecognitionResult) {
    const bufferSize = this.settings.useFixedBufferSize
      ? (this.settings.fixedBufferSize as BufferSize)
      : rawData.bufferSize;

    return { ...rawData, bufferSize };
  }

  private async getBreachProtocolImage(input?: AnalysisInput) {
    if (input) {
      if (typeof input === 'string') {
        const ext = extname(input).substr(1);
        const dest = this.robot.getScreenShotPath(ext);

        await copyFile(input, dest);

        return dest;
      } else {
        // Only jpeg format is supported when analyzing BP from clipboard.
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
    const { outputDevice, autoExit } = this.settings;
    const settings = { autoExit };

    return outputDevice === 'keyboard'
      ? new BreachProtocolKeyboardResolver(this.robot, settings, this.game.size)
      : new BreachProtocolMouseResolver(
          this.robot,
          settings,
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
      // FIXME: validate if this is ok to remove
      // sequences: bool ? this.game.sequences.map((s) => s.toJSON()) : null,
      sequences: null as any,
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

  private async recognize() {
    const image = sharp(this.fileName);
    const { downscaleSource, gameLang } = this.settings;
    const container = await SharpImageContainer.create(image, {
      downscaleSource,
    });
    const recognizer = new WasmBreachProtocolRecognizer(gameLang);

    return breachProtocolOCR(container, recognizer, this.settings);
  }
}
