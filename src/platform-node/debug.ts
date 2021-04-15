import { BreachProtocolFragmentResult } from '@/core';
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

const { version } = require('../../package.json');
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

export class BreachProtocolDebug {
  constructor(
    public fileName: string,
    public result: BreachProtocolFragmentResult<any, any, any>
  ) {}

  toJSON() {
    const { fileName } = this;
    const { id, rawData } = this.result;

    return {
      version,
      fileName,
      rawData: {
        id,
        rawData,
      },
    };
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
