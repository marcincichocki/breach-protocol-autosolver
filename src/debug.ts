import { ensureDirSync, readdirSync, remove, statSync } from 'fs-extra';
import { join } from 'path';
import sanitize from 'sanitize-filename';

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
