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
import { BreachProtocolRawData } from './common';

const debug = './debug';

function findOldestFile(files: string[], dir: string) {
  return files
    .map((file) => {
      const { ctime } = statSync(join(dir, file));

      return { ctime, file };
    })
    .sort((a, b) => a.ctime.getTime() - b.ctime.getTime())[0];
}

export async function removeOldestImage(limit: number) {
  ensureDirSync(debug);

  const images = readdirSync(debug).filter((f) => f.endsWith('.png'));

  if (images.length < limit) return;

  const { file } = findOldestFile(images, debug);

  return remove(join(debug, file));
}

export function getScreenShotPath() {
  const now = new Date().toString();
  const name = sanitize(now, { replacement: ' ' });

  return join(debug, `${name}.png`);
}

interface BreachProtocolDebugEntry extends BreachProtocolRawData {
  version: string;
  timestamp: string;
  fileName: string;
}

export function createDebugJson(data: BreachProtocolDebugEntry, limit: number) {
  const file = join(debug, 'debug.json');

  ensureFileSync(file);

  let json = readJsonSync(file, { throws: false });

  if (!json) {
    json = [];
  }

  json.unshift(data);

  if (json.length > limit) {
    json.pop();
  }

  return writeJsonSync(file, json);
}
