import { compile } from 'nexe';
import fs from 'fs-extra';
import path from 'path';
import upxFactory from 'upx';
import { ZipAFolder } from 'zip-a-folder';
import { name, version } from '../../package.json';

const upx = upxFactory({ better: true });
const dest = './build';
const fileName = `${name}-${version}`;
const output = path.join(dest, `${fileName}.exe`);

function removeDest() {
  return fs.remove(dest);
}

async function buildBinary() {
  await removeDest();
  await compile({
    input: './dist/index.js',
    resources: ['./BreachProtocol.traineddata'],
    output,
  });

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
    await fs.copy(file, path.join(dest, file));
  }
}

async function compress() {
  const filesToCompress = [
    output,
    path.join(dest, './node_modules/sharp/build/Release/libvips-42.dll'),
  ];

  await Promise.all(filesToCompress.map((f) => upx(f).start()));
}

async function main() {
  await buildBinary();
  await compress();
  await ZipAFolder.zip(dest, path.join('./dist', `${fileName}.zip`));
  await removeDest();
}

main();
