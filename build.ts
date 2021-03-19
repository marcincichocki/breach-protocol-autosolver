import { compile } from 'nexe';
import fs from 'fs-extra';
import path from 'path';
import { name, version } from './package.json';

(async () => {
  await fs.remove('./build');
  await compile({
    input: './dist/index.js',
    resources: ['./BreachProtocol.traineddata'],
    output: `./build/${name}-${version}.exe`,
  });

  // TODO: add LICESNSEs(?)
  // Some files might be missing on platform different than windows
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
    await fs.copy(file, path.join('./build', file));
  }
})();
