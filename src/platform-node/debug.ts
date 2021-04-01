import {
  BreachProtocolRawData,
  BreachProtocolResult,
  RawSequence,
  Sequence,
} from '@/core';
import {
  ensureDirSync,
  ensureFileSync,
  readdirSync,
  readJsonSync,
  remove,
  statSync,
  writeJsonSync,
} from 'fs-extra';
import { join } from 'path';
import sanitize from 'sanitize-filename';
import { options } from './cli';

const { version } = require('@@/package.json');
const debug = './debug';

function findOldestScreenShot(files: string[]) {
  return files
    .map((file) => {
      const { ctime } = statSync(join(debug, file));

      return { ctime, file };
    })
    .sort((a, b) => a.ctime.getTime() - b.ctime.getTime())[0];
}

export async function removeOldestScreenShot() {
  ensureDirSync(debug);

  const images = readdirSync(debug).filter((f) => f.endsWith('.png'));

  if (images.length < options.debugLimit) return;

  const { file } = findOldestScreenShot(images);

  return remove(join(debug, file));
}

export function getScreenShotPath() {
  const now = new Date().toString();
  const name = sanitize(now, { replacement: ' ' });

  return join(debug, `${name}.png`);
}

export interface BreachProtocolDebugEntry extends BreachProtocolRawData {
  version: string;
  fileName: string;
  path: string[];
  sequence: RawSequence;
  resolvedSequence: RawSequence;
  sequences: RawSequence[];
}

export class BreachProtocolDebug {
  constructor(
    public fileName: string,
    public rawData: BreachProtocolRawData,
    public result: BreachProtocolResult,
    public seqeunces: Sequence[]
  ) {}

  toJSON() {
    const { fileName } = this;
    const sequences = this.seqeunces.map((s) => s.toHex());
    const resolvedSequence = this.result.getResolvedSequence().toHex();
    const sequence = this.result.sequence.toHex();
    const path = this.result.path;

    return {
      version,
      fileName,
      path,
      sequence,
      resolvedSequence,
      sequences,
      ...this.rawData,
    } as BreachProtocolDebugEntry;
  }
}

export function appendToDebugJson(data: BreachProtocolDebug) {
  const file = join(debug, 'debug.json');

  ensureFileSync(file);

  let json = readJsonSync(file, { throws: false });

  if (!json) {
    json = [];
  }

  json.unshift(data);

  if (json.length > options.debugLimit) {
    json.pop();
  }

  return writeJsonSync(file, json, { spaces: 2 });
}
