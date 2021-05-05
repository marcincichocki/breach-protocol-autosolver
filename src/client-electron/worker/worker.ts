import { BitMask, setLang } from '@/common';
import {
  BreachProtocol,
  BreachProtocolData,
  BreachProtocolExitStrategy,
  breachProtocolOCR,
  BreachProtocolOCRFragment,
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
import { ipcRenderer as ipc } from 'electron';
import { listDisplays } from 'screenshot-desktop';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import {
  Action,
  BreachProtocolSolveProgress,
  BreachProtocolStatus,
  HistoryEntry,
  Request,
  workerListener,
  WorkerStatus,
} from '../common';

function updateStatus(payload: WorkerStatus) {
  dispatch({ type: 'SET_STATUS', payload });
}

function dispatch(action: Omit<Action, 'origin'>) {
  ipc.send('state', { ...action, origin: 'worker' });
}

ipc.on('SET_ACTIVE_DISPLAY', (event, state) => {
  screenId = state.id;
});

const disposeAsyncRequestListener = workerListener(handleAsyncRequest);

async function handleAsyncRequest(req: Request) {
  switch (req.type) {
    default:
  }
}

let screenId: string = null;

async function bootstrap() {
  updateStatus(WorkerStatus.BOOTSTRAP);

  setLang('en');
  const displays = await listDisplays();
  screenId = displays[0].id;

  dispatch({ type: 'SET_DISPLAYS', payload: displays });
  dispatch({ type: 'SET_ACTIVE_DISPLAY', payload: displays[0] });

  await BreachProtocolOCRFragment.initScheduler();

  ipc.send('worker:ready');
  updateStatus(WorkerStatus.READY);
}

bootstrap();

ipc.on('worker:solve', async () => {
  updateStatus(WorkerStatus.WORKING);

  const bpa = new BreachProtocolAutosolver(screenId);
  await bpa.solve();

  dispatch({ type: 'ADD_HISTORY_ENTRY', payload: bpa.toJSON() });
  updateStatus(WorkerStatus.READY);
});

//  ---------------------------------------------

class BreachProtocolAutosolver {
  private uuid = uuidv4();

  private fileName: string;

  private startedAt = Date.now();

  private finishedAt: number;

  private data: BreachProtocolData;

  private sequences: Sequence[];

  private game: BreachProtocol;

  private result: BreachProtocolResult;

  private exitStrategy: BreachProtocolExitStrategy;

  recognitionResult: BreachProtocolRecognitionResult;

  private status: BreachProtocolStatus = BreachProtocolStatus.PENDING;

  private progress = new BitMask(BreachProtocolSolveProgress.Pending);

  constructor(private readonly screenId: string) {}

  private getFragmentsValidState() {
    if (this.progress.has(BreachProtocolSolveProgress.FragmentsValid)) {
      return { sequences: this.sequences.map((s) => s.toJSON()) };
    }
  }

  private getSolutionFoundState() {
    if (this.progress.has(BreachProtocolSolveProgress.SolutionFound)) {
      return {
        result: this.result.toJSON(),
        exitStrategy: this.exitStrategy,
      };
    }
  }

  private getBaseState() {
    const {
      uuid,
      startedAt,
      finishedAt,
      status,
      recognitionResult,
      fileName,
    } = this;

    return {
      uuid,
      startedAt,
      finishedAt,
      recognitionResult: recognitionResult.results,
      status,
      options,
      fileName,
    };
  }

  toJSON(): HistoryEntry {
    return {
      ...this.getBaseState(),
      ...this.getFragmentsValidState(),
      ...this.getSolutionFoundState(),
    };
  }

  async solve() {
    // TODO: keep or delete source
    this.fileName = (await captureScreen(this.screenId)) as string;
    this.recognitionResult = await this.recognize();

    if (!this.recognitionResult.valid) {
      this.status = BreachProtocolStatus.FAILED;
      this.finishedAt = Date.now();

      // TODO: notify user about error
      return this.status;
    }

    this.progress.add(BreachProtocolSolveProgress.FragmentsValid);
    this.data = transformRawData(this.recognitionResult.rawData);
    this.sequences = makeSequences(this.data.daemons, this.data.bufferSize);
    this.game = new BreachProtocol(this.data.tGrid, this.data.bufferSize);
    this.result = this.game.solve(this.sequences);

    // TODO: handle no solutions
    if (!this.result) {
      this.status = BreachProtocolStatus.FAILED;
      this.finishedAt = Date.now();

      return this.status;
    }

    this.progress.add(BreachProtocolSolveProgress.SolutionFound);
    this.exitStrategy = resolveExitStrategy(this.result, this.data);

    await resolveBreachProtocol(
      this.result.path,
      this.recognitionResult.positionSquareMap,
      this.exitStrategy
    );

    this.status = BreachProtocolStatus.SUCCEEDED;
    this.finishedAt = Date.now();

    return this.status;
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
