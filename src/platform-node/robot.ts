import { Point, t, getScaling } from '@/common';
import { BreachProtocolExitStrategy } from '@/core';
import { execFile } from 'child_process';
import isWsl from 'is-wsl';
import screenshot from 'screenshot-desktop';
import { options } from './cli';
import { getScreenShotPath, removeOldestScreenShot } from './debug';

export async function resolveBreachProtocol(
  path: string[],
  squareMap: Map<string, Point>,
  { shouldForceClose, willExit }: BreachProtocolExitStrategy
) {
  const to = await mouseMove();

  for (const square of path) {
    const { x, y } = squareMap.get(square);

    await to(x, y);
    await click();
    await sleep();
  }

  // Breach protocol exits on its own when sequence fill
  // buffer completly.
  if (!willExit && !options.disableAutoExit) {
    // If buffer is not yet filled, but sequence is finished
    // breach protocol will hang on exit screen. Pressing esc
    // exits it.
    await exit();

    // Sometimes sequence does not use every daemon, and there might be
    // a rare case in which sequence ended, but there is still enough space
    // in a buffer to fit leftover daemons. However, since it is impossible
    // to find correct squares, autosolver will stop.
    // To hanlde such case we have to press esc twice: once to stop it, and
    // second time to exit it.
    if (shouldForceClose) {
      await exit();
    }
  }
}

export async function captureScreen(screen: string) {
  // Move pointer away to not mess with ocr.
  await movePointerAway();
  await removeOldestScreenShot();

  const filename = getScreenShotPath();

  return screenshot({ format: 'png', screen, filename });
}

async function nircmd(command: string, options = {}) {
  const bin = './vendor/nircmd/nircmd.exe';

  if (process.platform !== 'win32' && !isWsl) {
    throw new Error(t`UNSUPORTED_OS`);
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
  const scaling = options.useScaling ? getScaling() : 1;

  return async (x: number, y: number) => {
    const sX = (x - oldX) / scaling;
    const sY = (y - oldY) / scaling;
    const r = await move(sX, sY);

    oldX = x;
    oldY = y;

    return r;
  };
}

function sleep(delay: number = options.delay) {
  return new Promise((r) => setTimeout(r, delay));
}

function exit() {
  return nircmd('sendkeypress esc');
}
