import { compile } from 'nexe';
import fs from 'fs-extra';
import path from 'path';
import { name, version } from './package.json';

const DEST = './build';

async function buildBinary() {
  await fs.remove(DEST);

  const output = path.join(DEST, `${name}-${version}.exe`);

  await compile({
    input: './dist/index.js',
    resources: ['./BreachProtocol.traineddata'],
    output,
  });

  // TODO: add LICESNSEs(?)
  const files = [
    // nircmd
    './vendor/nircmd/nircmd.exe',

    // tesseract
    './node_modules/tesseract.js-core/index.js',
    './node_modules/tesseract.js-core/tesseract-core.js',
    './node_modules/tesseract.js-core/tesseract-core.wasm',
    './node_modules/tesseract.js/src',

    // sharp
    './node_modules/sharp/build/Release',

    // screenshot-desktop
    './node_modules/screenshot-desktop/lib/win32',

    // iohook
    './node_modules/iohook/builds',

    // misc
    './node_modules/file-type',
    './node_modules/bmp-js',
  ];

  for (const file of files) {
    await fs.copy(file, path.join(DEST, file));
  }
}
