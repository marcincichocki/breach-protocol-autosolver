import {
  BreachProtocolExitStrategy,
  GapDirection,
  getShortestGap,
} from '@/core';
import { Point } from '../util';
import { BreachProtocolRobot, BreachProtocolRobotKeys } from './robot';

export interface ResolverSettings {
  autoExit: boolean;
}

export abstract class BreachProtocolResolver {
  protected readonly dirs: Record<GapDirection, BreachProtocolRobotKeys> = {
    left: BreachProtocolRobotKeys.Left,
    right: BreachProtocolRobotKeys.Right,
    top: BreachProtocolRobotKeys.Up,
    bottom: BreachProtocolRobotKeys.Down,
  };

  constructor(
    protected readonly robot: BreachProtocolRobot,
    private readonly settings: ResolverSettings
  ) {}

  /** Send solution to the game. */
  abstract resolve(path: string[]): Promise<void>;

  /**
   * Stop and/or exit breach protocol if it's necessary.
   *
   * There are few cases to handle:
   *
   * ```text
   * #1: Buffer and path have same lengths.
   *
   *     Game will close BP on its own. No action required.
   *
   *
   * #2: Every daemon was solved, but buffer is not yet filled.
   *
   *     Game will display exit modal, autosolver should exit if "autoExit" option is
   *     turned on. Otherwise don't do anything.
   *
   *
   * #3: Sequence didn't include every daemon and there is space in a buffer still.
   *
   *     It's required to stop BP manually, and then exit if "autoExit" option is
   *     turned on.
   * ```
   */
  async stopAndExit({
    willExit,
    shouldForceClose,
  }: BreachProtocolExitStrategy) {
    // Game will exit on its own. No action required.
    if (willExit) return;

    // Always stop BP if it doesn't exit on its own to display the exit modal.
    if (shouldForceClose) {
      await this.robot.pressKey(BreachProtocolRobotKeys.Escape);
    }

    // Exit only when BP will not exit on its own and "autoExit" option in turned on.
    if (!willExit && this.settings.autoExit) {
      await this.robot.pressKey(BreachProtocolRobotKeys.Escape);
    }
  }
}

export class BreachProtocolKeyboardResolver extends BreachProtocolResolver {
  constructor(
    robot: BreachProtocolRobot,
    settings: ResolverSettings,
    private readonly size: number
  ) {
    super(robot, settings);
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
    settings: ResolverSettings,
    private readonly squareMap: Map<string, Point>
  ) {
    super(robot, settings);
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
