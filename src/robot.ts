import { execFile } from 'child_process';
import isWsl from 'is-wsl';
import screenshot from 'screenshot-desktop';
import { Point } from './util';

export async function resolveBreachProtocol(
  path: string[],
  squareMap: Map<string, Point>
) {
  const to = await mouseMove();

  for (const square of path) {
    const { x, y } = squareMap.get(square);

    await to(x, y);
    await click();
    await sleep(75);
  }
}

export async function captureScreen(screen: string) {
  // Move pointer away to not mess with ocr.
  await movePointerAway();

  return screenshot({ format: 'png', screen });
}

async function nircmd(command: string, options = {}) {
  const bin = './vendor/nircmd/nircmd.exe';

  if (process.platform !== 'win32' && !isWsl) {
    throw new Error('Only windows is supported');
  }

  return new Promise((resolve, reject) => {
    execFile(bin, command.split(' '), options, (err, res) => {
      if (err) {
        reject(err);
      } else {
        resolve(res);
      }
    });
  });
}

function movePointerAway() {
  return move(-9999, -9999);
}

function move(...args: number[]) {
  return nircmd(`sendmouse move ${args.join(' ')}`);
}

function click() {
  return nircmd('sendmouse left click');
}

async function mouseMove(restart = true) {
  if (restart) {
    await movePointerAway();
  }

  let oldX = 0;
  let oldY = 0;

  return async (x: number, y: number) => {
    const r = await move(x - oldX, y - oldY);

    oldX = x;
    oldY = y;

    return r;
  };
}

function sleep(delay: number) {
  return new Promise((r) => setTimeout(r, delay));
}
