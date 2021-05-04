import { setLang } from '@/common';
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

ipc.on('worker:solve', async (event) => {
  updateStatus(WorkerStatus.WORKING);
  // await solveBreachProtocol(screenId);

  const bpa = new BreachProtocolAutosolver(screenId);

  await bpa.start();

  console.log(JSON.stringify(bpa));

  event.sender.send('worker:solved');
  updateStatus(WorkerStatus.READY);
});

//  ---------------------------------------------

class BreachProtocolAutosolver {
  private uuid = uuidv4();

  private source: string;

  private timeStart = Date.now();

  private timeEnd: number;

  private data: BreachProtocolData;

  private sequences: Sequence[];

  private game: BreachProtocol;

  private result: BreachProtocolResult;

  private exitStrategy: BreachProtocolExitStrategy;

  recognitionResult: BreachProtocolRecognitionResult;

  private status: 'success' | 'fail';

  constructor(private readonly screenId: string) {}

  toJSON() {
    console.log('TOJSON');

    const { uuid, timeStart, timeEnd, status, recognitionResult } = this;

    return {
      uuid,
      timeStart,
      timeEnd,
      recognitionResult,
      status,
    } as HistoryEntry;
  }

  async start() {
    // TODO: keep or delete source
    this.source = (await captureScreen(this.screenId)) as string;
    this.recognitionResult = await this.recognize();

    if (!this.recognitionResult.valid) {
      this.status = 'fail';
      this.timeEnd = Date.now();

      // TODO: notify user about error
      return;
    }

    this.data = transformRawData(this.recognitionResult.rawData);
    this.sequences = makeSequences(this.data.daemons, this.data.bufferSize);
    this.game = new BreachProtocol(this.data.tGrid, this.data.bufferSize);
    this.result = this.game.solve(this.sequences);

    // TODO: handle no solutions
    if (!this.result) {
      this.status = 'fail';
      this.timeEnd = Date.now();
    }

    this.exitStrategy = resolveExitStrategy(this.result, this.data);

    await resolveBreachProtocol(
      this.result.path,
      this.recognitionResult.positionSquareMap,
      this.exitStrategy
    );

    this.status = 'success';
    this.timeEnd = Date.now();
  }

  async recognize() {
    const image = sharp(this.source);
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
