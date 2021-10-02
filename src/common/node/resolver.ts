import {
  BreachProtocolExitStrategy,
  GapDirection,
  getShortestGap,
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

  /** Send solution to the game. */
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
  constructor(robot: BreachProtocolRobot, private readonly size: number) {
    super(robot);
  }

  async resolve(path: string[]) {
    let from = await this.init();

    for (const to of path) {
      const empty = this.getEmptySerie(from, to, path);

      await this.moveToPosition(from, to, empty);
      await this.robot.pressKey(BreachProtocolRobotKeys.Enter);

      from = to;
    }
  }

  private getEmptySerie(from: string, to: string, path: string[]) {
    const isHorizontal = from[0] === to[0];
    const stable = isHorizontal ? from[0] : from[1];
    const unstableIndex = isHorizontal ? 1 : 0;

    return path
      .slice(0, path.indexOf(to))
      .filter((s) => s.includes(stable))
      .map((s) => s[unstableIndex]);
  }

  private async moveToPosition(from: string, to: string, empty: string[]) {
    // Path can start with "A1".
    if (from === to) return;

    const { offset, dir } = getShortestGap(from, to, this.size, empty);
    let i = Math.abs(offset);

    while (i--) {
      await this.robot.pressKey(this.dirs[dir]);
    }
  }

  private async init() {
    // If pointer is hovering over grid next commands can be uncertain.
    await this.robot.moveAway();
    // Select "A1" square.
    await this.robot.pressKey(BreachProtocolRobotKeys.Left);
    await this.robot.pressKey(BreachProtocolRobotKeys.Right);

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
    }
  }
}
