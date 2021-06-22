import {
  BreachProtocolExitStrategy,
  BreachProtocolResult,
  getOffset,
} from '@/core';
import { Point } from '../util';
import { BreachProtocolRobot, Keys } from './robot';

export abstract class BreachProtocolResolver {
  constructor(public readonly robot: BreachProtocolRobot) {}

  abstract resolve(path: string[]): Promise<void>;

  async resolveAndExit({ path, exitStrategy }: BreachProtocolResult) {
    await this.resolve(path);
    await this.handleExit(exitStrategy);
  }

  async handleExit({ willExit, shouldForceClose }: BreachProtocolExitStrategy) {
    // Breach protocol exits on its own when sequence fill
    // buffer completly.
    if (!willExit && this.robot.settings.autoExit) {
      // If buffer is not yet filled, but sequence is finished
      // breach protocol will hang on exit screen. Pressing esc
      // exits it.
      await this.robot.exit();

      // Sometimes sequence does not use every daemon, and there might be
      // a rare case in which sequence ended, but there is still enough space
      // in a buffer to fit leftover daemons. However, since it is impossible
      // to find correct squares, autosolver will stop.
      // To hanlde such case we have to press esc twice: once to stop it, and
      // second time to exit it.
      if (shouldForceClose) {
        await this.robot.exit();
      }
    }
  }
}

export class BreachProtocolKeyboardResolver extends BreachProtocolResolver {
  async resolve(path: string[]) {
    let from = 'A1';
    await this.init();

    for (const to of path) {
      const { offset, dir } = getOffset(from, to);
      const key = this.robot.getKeyFromDir(dir);
      const absOffset = Math.abs(offset);

      for (let i = 0; i < absOffset; i++) {
        await this.robot.pressKey(key);
        await this.robot.sleep();
      }

      from = to;
    }
  }

  private async init() {
    // If pointer is hovering over grid next commands can be uncertain.
    await this.robot.movePointerAway();
    // Select "A1" square.
    await this.robot.pressKey(Keys.Left);
    await this.robot.pressKey(Keys.Right);
  }
}

export class BreachProtocolMouseResolver extends BreachProtocolResolver {
  constructor(
    robot: BreachProtocolRobot,
    public readonly squareMap: Map<string, Point>
  ) {
    super(robot);
  }

  async resolve(path: string[]) {
    await this.robot.movePointerAway();

    for (const square of path) {
      const { x, y } = this.squareMap.get(square);

      await this.robot.move(x, y, false);
      await this.robot.click();
      await this.robot.sleep();
    }
  }
}
