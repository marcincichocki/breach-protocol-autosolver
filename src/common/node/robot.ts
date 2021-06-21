import { Point } from '@/common';
import { BreachProtocolResult, getOffset } from '@/core';
import { execFile } from 'child_process';
import { join } from 'path';
import sanitize from 'sanitize-filename';
import screenshot, { ScreenshotFormat } from 'screenshot-desktop';

export interface RobotSettings {
  delay: number;
  activeDisplayId: string;
  format: ScreenshotFormat;
  screenshotDir: string;
  autoExit: boolean;
  useScaling: boolean;
}

export abstract class Robot {
  constructor(
    protected readonly settings: RobotSettings,
    protected readonly scaling: number = 1
  ) {}

  abstract click(): Promise<any>;

  abstract move(x: number, y: number, restart?: boolean): Promise<any>;

  abstract movePointerAway(): Promise<any>;

  abstract exit(): Promise<any>;

  abstract pressKey(key: string): Promise<any>;

  sleep(delay: number = this.settings.delay) {
    return new Promise((r) => setTimeout(r, delay));
  }

  async captureScreen(screen: string = this.settings.activeDisplayId) {
    await this.movePointerAway();

    const { format } = this.settings;
    const filename = this.getScreenShotPath(format);

    // screenshot-desktop always returns string if filename is provided.
    return screenshot({ format, screen, filename }) as Promise<string>;
  }

  private getScreenShotPath(ext: string) {
    const now = new Date().toString();
    const name = sanitize(now, { replacement: ' ' });

    return join(this.settings.screenshotDir, `${name}.${ext}`);
  }
}

export abstract class BreachProtocolRobot extends Robot {
  async resolveBreachProtocolWithKeyboard({
    path,
    exitStrategy,
  }: BreachProtocolResult) {
    // start at A1
    await this.movePointerAway();
    await this.pressKey('left');
    await this.pressKey('right');

    let from = 'A1';
    for (const to of path) {
      const { offset, orientation } = getOffset(from, to);
      const dir =
        orientation === 'horizontal'
          ? offset < 0
            ? 'left'
            : 'right'
          : orientation === 'vertical'
          ? offset < 0
            ? 'up'
            : 'down'
          : null;
      const absOffset = Math.abs(offset);

      for (let i = 0; i < absOffset; i++) {
        await this.pressKey(dir);
        await this.sleep();
      }

      from = to;
    }
  }

  async resolveBreachProtocol(
    { path, exitStrategy }: BreachProtocolResult,
    squareMap: Map<string, Point>
  ) {
    await this.movePointerAway();

    for (const square of path) {
      const { x, y } = squareMap.get(square);

      await this.move(x, y, false);
      await this.click();
      await this.sleep();
    }

    // Breach protocol exits on its own when sequence fill
    // buffer completly.
    if (!exitStrategy.willExit && this.settings.autoExit) {
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
      if (exitStrategy.shouldForceClose) {
        await this.exit();
      }
    }
  }
}

export class WindowsRobot extends BreachProtocolRobot {
  private x = 0;
  private y = 0;

  private readonly bin = './resources/win32/nircmd/nircmd.exe';

  click() {
    return this.nircmd('sendmouse left click');
  }

  async move(x: number, y: number, restart = true) {
    if (restart) {
      await this.movePointerAway();
    }

    const scaling = this.settings.useScaling ? this.scaling : 1;
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
    return this.pressKey('esc');
  }

  private nircmd(command: string, options = {}) {
    const args = command.split(' ');

    return new Promise((resolve, reject) => {
      execFile(this.bin, args, options, (err, res) => {
        if (err) {
          reject(err);
        } else {
          resolve(res);
        }
      });
    });
  }

  private moveRelative(x: number, y: number) {
    return this.nircmd(`sendmouse move ${x} ${y}`);
  }

  pressKey(key: string) {
    return this.nircmd(`sendkeypress ${key}`);
  }
}

// TODO: Add linux and macos robots
function getPlatformRobot(platform = process.platform) {
  switch (platform) {
    case 'win32':
      return WindowsRobot;
    default:
      return WindowsRobot;
  }
}

export const PlatformRobot = getPlatformRobot();
