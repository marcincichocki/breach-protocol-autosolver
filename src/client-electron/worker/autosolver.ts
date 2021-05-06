import { BitMask } from '@/common';
import {
  BreachProtocol,
  BreachProtocolData,
  BreachProtocolExitStrategy,
  breachProtocolOCR,
  BreachProtocolRecognitionResult,
  BreachProtocolResult,
  makeSequences,
  resolveExitStrategy,
  Sequence,
  SharpImageContainer,
  transformRawData,
} from '@/core';
import { options } from '@/platform-node/cli';
import { captureScreen, resolveBreachProtocol } from '@/platform-node/robot';
import { remove } from 'fs-extra';
import sharp from 'sharp';
import { play } from 'sound-play';
import { v4 as uuidv4 } from 'uuid';
import {
  BreachProtocolSolveProgress,
  BreachProtocolStatus,
  HistoryEntry,
} from '../common';

export class BreachProtocolAutosolver {
  private readonly uuid = uuidv4();

  private fileName: string;

  private startedAt = Date.now();

  private finishedAt: number;

  private data: BreachProtocolData;

  private sequences: Sequence[];

  private game: BreachProtocol;

  private result: BreachProtocolResult;

  private exitStrategy: BreachProtocolExitStrategy;

  private recognitionResult: BreachProtocolRecognitionResult;

  private status: BreachProtocolStatus = BreachProtocolStatus.Pending;

  private progress = new BitMask(BreachProtocolSolveProgress.Pending);

  constructor(private readonly screenId: string) {}

  async solve() {
    this.fileName = (await captureScreen(this.screenId)) as string;
    this.recognitionResult = await this.recognize();

    if (!this.recognitionResult.valid) {
      return this.reject();
    }

    this.progress.add(BreachProtocolSolveProgress.FragmentsValid);
    this.data = transformRawData(this.recognitionResult.rawData);
    this.sequences = makeSequences(this.data.daemons, this.data.bufferSize);
    this.game = new BreachProtocol(this.data.tGrid, this.data.bufferSize);
    this.result = this.game.solve(this.sequences);

    if (!this.result) {
      return this.reject();
    }

    this.progress.add(BreachProtocolSolveProgress.SolutionFound);
    this.exitStrategy = resolveExitStrategy(this.result, this.data);

    await resolveBreachProtocol(
      this.result.path,
      this.recognitionResult.positionSquareMap,
      this.exitStrategy
    );

    return this.resolve();
  }

  toJSON(): HistoryEntry {
    return {
      ...this.getBaseState(),
      ...this.getFragmentsValidState(),
      ...this.getSolutionFoundState(),
    };
  }

  private getBaseState() {
    return {
      uuid: this.uuid,
      status: this.status,
      startedAt: this.startedAt,
      finishedAt: this.finishedAt,
      fileName: this.fileName,
      fragments: this.recognitionResult.results,
      options,
    };
  }

  private getFragmentsValidState() {
    const bool = this.progress.has(BreachProtocolSolveProgress.FragmentsValid);

    return {
      sequences: bool ? this.sequences.map((s) => s.toJSON()) : null,
    };
  }

  private getSolutionFoundState() {
    const bool = this.progress.has(BreachProtocolSolveProgress.SolutionFound);

    return {
      result: bool ? this.result.toJSON() : null,
      exitStrategy: bool ? this.exitStrategy : null,
    };
  }

  private reject() {
    this.notifyUser();

    return this.finishWithStatus(BreachProtocolStatus.Rejected);
  }

  private resolve() {
    this.removeSourceImage();

    return this.finishWithStatus(BreachProtocolStatus.Resolved);
  }

  private finishWithStatus(status: BreachProtocolStatus) {
    this.status = status;
    this.finishedAt = Date.now();

    return this.status;
  }

  private notifyUser() {
    if (!options.disableSound) {
      play(options.soundPath);
    }
  }

  private removeSourceImage() {
    remove(this.fileName);
    this.fileName = null;
  }

  async recognize() {
    const image = sharp(this.fileName);
    const container = await SharpImageContainer.create(image);

    return breachProtocolOCR(
      container,
      {
        bufferSize: options.thresholdBufferSize,
        daemons: options.thresholdDaemons,
        grid: options.thresholdGrid,
      },
      options.experimentalBufferSizeRecognition
    );
  }
}
