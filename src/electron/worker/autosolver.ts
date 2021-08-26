import { BitMask } from '@/common';
import {
  BreachProtocolKeyboardResolver,
  BreachProtocolMouseResolver,
  BreachProtocolResolver,
  BreachProtocolRobot,
  SharpImageContainer,
} from '@/common/node';
import {
  BreachProtocol,
  breachProtocolOCR,
  BreachProtocolRecognitionResult,
  BreachProtocolResult,
  FragmentId,
} from '@/core';
import {
  AppSettings,
  BreachProtocolSolveProgress,
  BreachProtocolStatus,
  HistoryEntry,
} from '@/electron/common';
import { remove } from 'fs-extra';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';

export class BreachProtocolAutosolver {
  private readonly uuid = uuidv4();

  private fileName: string;

  private readonly startedAt = Date.now();
  private finishedAt: number;

  private recognitionResult: BreachProtocolRecognitionResult;
  private game: BreachProtocol;
  private result: BreachProtocolResult;

  private status: BreachProtocolStatus = BreachProtocolStatus.Pending;
  private progress = new BitMask(BreachProtocolSolveProgress.Pending);

  constructor(
    private readonly settings: AppSettings,
    private readonly robot: BreachProtocolRobot
  ) {}

  async solve() {
    this.notifyUser('start');

    this.fileName = await this.robot.captureScreen();
    this.recognitionResult = await this.recognize();

    if (!this.recognitionResult.isValid) {
      return this.reject();
    }

    this.progress.add(BreachProtocolSolveProgress.FragmentsValid);
    this.game = new BreachProtocol(this.recognitionResult.rawData);
    this.result = this.game.solve();

    if (!this.result) {
      return this.reject();
    }

    this.progress.add(BreachProtocolSolveProgress.SolutionFound);

    await this.resolveBreachProtocol(this.result);

    return this.resolve();
  }

  private getResolver(): BreachProtocolResolver {
    return this.settings.outputDevice === 'keyboard'
      ? new BreachProtocolKeyboardResolver(this.robot, this.game.size)
      : new BreachProtocolMouseResolver(
          this.robot,
          this.recognitionResult.positionSquareMap
        );
  }

  private async resolveBreachProtocol({
    path,
    exitStrategy,
  }: BreachProtocolResult) {
    const resolver = this.getResolver();

    await resolver.resolve(path);

    if (this.settings.autoExit) {
      await resolver.handleExit(exitStrategy);
    }
  }

  private toJSON(): HistoryEntry {
    return {
      ...this.getBaseState(),
      ...this.getFragmentsValidState(),
      ...this.getSolutionFoundState(),
    };
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
      result: bool ? this.result.toJSON() : null,
    };
  }

  private reject() {
    this.notifyUser('error');

    return this.finishWithStatus(BreachProtocolStatus.Rejected);
  }

  private resolve() {
    if (!this.settings.preserveSourceOnSuccess) {
      this.removeSourceImage();
    }

    return this.finishWithStatus(BreachProtocolStatus.Resolved);
  }

  private finishWithStatus(status: BreachProtocolStatus) {
    this.status = status;
    this.finishedAt = Date.now();

    return this.toJSON();
  }

  private notifyUser(type: 'start' | 'error') {
    if (this.settings.soundEnabled) {
      const source =
        type === 'start'
          ? this.settings.startSoundPath
          : this.settings.errorSoundPath;

      if (source) {
        new Audio(source).play();
      }
    }
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
      thresholdBufferSize,
      thresholdBufferSizeAuto,
    } = this.settings;

    return {
      grid: thresholdGridAuto ? undefined : thresholdGrid,
      daemons: thresholdDaemonsAuto ? undefined : thresholdDaemons,
      bufferSize: thresholdBufferSizeAuto ? undefined : thresholdBufferSize,
    };
  }

  async recognize() {
    const image = sharp(this.fileName);
    const container = await SharpImageContainer.create(image);

    return breachProtocolOCR(
      container,
      this.getFixedThresholds(),
      this.settings.experimentalBufferSizeRecognition
    );
  }
}
