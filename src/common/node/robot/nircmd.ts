import { sleep } from '@/common';
import { BreachProtocolRobotKeys, RobotSettings } from './robot';
import { WindowsRobot } from './win32';

export class NirCmdRobot extends WindowsRobot {
  private x = 0;
  private y = 0;

  protected readonly binPath = './resources/win32/nircmd/nircmd.exe';

  constructor(
    settings: RobotSettings,
    private readonly scaling: number,
    private readonly width: number,
    private readonly height: number
  ) {
    super(settings);
  }

  async activateGameWindow() {
    await this.bin(`win activate stitle ${this.gameWindowTitle}`);
    // Wait extra time as nircmd will not wait for window to be actually
    // actived. This could cause errors when entering sequence, as keystrokes
    // could be sent before game can receive them
    await sleep(500);
  }

  click() {
    return this.bin('sendmouse left click');
  }

  async move(x: number, y: number, restart = true) {
    if (restart) {
      await this.moveAway();
    }

    const sX = x - this.x;
    const sY = y - this.y;
    const r = await this.moveRelative(sX, sY);

    this.x = x;
    this.y = y;

    return r;
  }

  moveAway() {
    this.x = this.width;
    this.y = this.height;

    return this.moveRelative(this.width, this.height);
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`sendkeypress 0x${this.getMappedKey(key)}`);
  }

  private moveRelative(x: number, y: number) {
    return this.bin(`sendmouse move ${this.scale(x)} ${this.scale(y)}`);
  }

  private scale(value: number) {
    return Math.round(value / this.scaling);
  }
}
