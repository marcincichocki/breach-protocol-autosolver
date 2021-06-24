import {
  BreachProtocolExitStrategy,
  GapDirection,
  getGap,
  isBetween,
} from '@/core';
import { Point } from '../util';
import { BreachProtocolRobot, BreachProtocolRobotKeys } from './robot';

export abstract class BreachProtocolResolver {
  protected readonly dirs: Record<GapDirection, BreachProtocolRobotKeys> = {
    left: BreachProtocolRobotKeys.Left,
    right: BreachProtocolRobotKeys.Right,
    top: BreachProtocolRobotKeys.Up,
    bottom: BreachProtocolRobotKeys.Down,
  };

  constructor(protected readonly robot: BreachProtocolRobot) {}

  /** Output solution to the game. */
  abstract resolve(path: string[]): Promise<void>;

  /** Exit BP manually if required. */
  async handleExit({ willExit, shouldForceClose }: BreachProtocolExitStrategy) {
    // Breach protocol exits on its own when sequence fill buffer completly.
    if (!willExit) {
      // If buffer is not yet filled, but sequence is finished
      // breach protocol will hang on exit screen. Pressing esc
      // exits it.
      await this.robot.pressKey(BreachProtocolRobotKeys.Escape);

      // Sometimes sequence does not use every daemon, and there might be
      // a rare case in which sequence ended, but there is still enough space
      // in a buffer to fit leftover daemons. However, since it is impossible
      // to find correct squares, autosolver will stop.
      // To hanlde such case we have to press esc twice: once to stop it, and
      // second time to exit it.
      if (shouldForceClose) {
        await this.robot.pressKey(BreachProtocolRobotKeys.Escape);
      }
    }
  }
}

export class BreachProtocolKeyboardResolver extends BreachProtocolResolver {
  async resolve(path: string[]) {
    let from = await this.init();

    for (const to of path) {
      const done = path.slice(0, path.indexOf(to));

      await this.moveToPosition(from, to, done);
      await this.robot.pressKey(BreachProtocolRobotKeys.Enter);
      await this.robot.sleep();

      from = to;
    }
  }

  private async moveToPosition(from: string, to: string, done: string[]) {
    // Path can start with "A1".
    if (from === to) {
      return;
    }

    const { offset, dir, orientation } = getGap(from, to);
    // Get row or column part of squares.
    const serie = orientation === 'horizontal' ? from[0] : from[1];
    const key = this.dirs[dir];
    // Get amount of "blank" squares in a line to target.
    const { length } = done
      // Remove stuff that is not on the same row or column.
      .filter((s) => s.includes(serie))
      // Only leave items that are between.
      .filter((s) => isBetween(s, from, to));

    // Remove "blank" squares from offset.
    let i = Math.abs(offset) - length;

    while (i--) {
      await this.robot.pressKey(key);
      await this.robot.sleep();
    }
  }

  private async init() {
    // If pointer is hovering over grid next commands can be uncertain.
    await this.robot.moveAway();
    await this.robot.sleep();
    // Select "A1" square.
    await this.robot.pressKey(BreachProtocolRobotKeys.Left);
    await this.robot.sleep();
    await this.robot.pressKey(BreachProtocolRobotKeys.Right);
    await this.robot.sleep();

    return 'A1';
  }
}

export class BreachProtocolMouseResolver extends BreachProtocolResolver {
  constructor(
    robot: BreachProtocolRobot,
    private readonly squareMap: Map<string, Point>
  ) {
    super(robot);
  }

  async resolve(path: string[]) {
    await this.robot.moveAway();

    for (const square of path) {
      const { x, y } = this.squareMap.get(square);

      await this.robot.move(x, y, false);
      await this.robot.click();
      await this.robot.sleep();
    }
  }
}