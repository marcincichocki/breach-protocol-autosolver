import { Point } from '@/common';
import { BreachProtocolExitStrategy } from '@/core';
import { execFile } from 'child_process';
import { ensureDirSync } from 'fs-extra';
import { join } from 'path';
import sanitize from 'sanitize-filename';
import screenshot from 'screenshot-desktop';
import { AppSettings } from '../common';

export abstract class Robot {
  private screenshotDir = join(this.basePath, 'screenshots');

  constructor(
    protected readonly settings: AppSettings,
    private readonly basePath: string
  ) {
    ensureDirSync(this.screenshotDir);
  }

  abstract click(): Promise<any>;

  abstract movePointerAway(): Promise<any>;

  abstract exit(): Promise<any>;

  abstract move(x: number, y: number): Promise<any>;

  sleep(delay: number = this.settings.delay) {
    return new Promise((r) => setTimeout(r, delay));
  }

  async captureScreen(screen: string = this.settings.activeDisplayId) {
    // TODO: move pointer back
    // TODO: remove oldest screenshot
    await this.movePointerAway();

    const { format } = this.settings;
    const filename = this.getScreenShotPath(format);

    // screenshot-desktop always returns string if filename is provided.
    return screenshot({ format, screen, filename }) as Promise<string>;
  }

  private getScreenShotPath(ext: string) {
    const now = new Date().toString();
    const name = sanitize(now, { replacement: ' ' });

    return join(this.screenshotDir, `${name}.${ext}`);
  }
}

export abstract class BreachProtocolRobot extends Robot {
  async resolveBreachProtocol(
    path: string[],
    squareMap: Map<string, Point>,
    { shouldForceClose, willExit }: BreachProtocolExitStrategy
  ) {
    this.movePointerAway();

    for (const square of path) {
      const { x, y } = squareMap.get(square);

      await this.move(x, y);
      // await this.click();
      await this.sleep();
    }

    // Breach protocol exits on its own when sequence fill
    // buffer completly.
    if (!willExit && this.settings.autoExit) {
      // If buffer is not yet filled, but sequence is finished
      // breach protocol will hang on exit screen. Pressing esc
      // exits it.
      await this.exit();

      // Sometimes sequence does not use every daemon, and there might be
      // a rare case in which sequence ended, but there is still enough space
      // in a buffer to fit leftover daemons. However, since it is impossible
      // to find correct squares, autosolver will stop.
      // To hanlde such case we have to press esc twice: once to stop it, and
      // second time to exit it.
      if (shouldForceClose) {
        await this.exit();
      }
    }
  }
}

export class WindowsRobot extends BreachProtocolRobot {
  private x = 0;
  private y = 0;

  private nircmd(command: string, options = {}) {
    const bin = './vendor/nircmd/nircmd.exe';
    const args = command.split(' ');

    return new Promise((resolve, reject) => {
      execFile(bin, args, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  click() {
    return this.nircmd('sendmouse left click');
  }

  async move(x: number, y: number) {
    // TODO: use settings;
    const scaling = 1;
    const sX = (x - this.x) / scaling;
    const sY = (y - this.y) / scaling;
    const r = await this.moveRelative(sX, sY);

    this.x = x;
    this.y = y;

    return r;
  }

  movePointerAway() {
    this.x = 0;
    this.y = 0;

    return this.moveRelative(-9999, -9999);
  }

  exit() {
    return this.nircmd('sendkeypress esc');
  }

  private moveRelative(x: number, y: number) {
    return this.nircmd(`sendmouse move ${x} ${y}`);
  }
}
