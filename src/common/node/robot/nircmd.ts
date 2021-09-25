import { BreachProtocolRobotKeys } from './robot';
import { WindowsRobot } from './win32';

export class NirCmdRobot extends WindowsRobot {
  private x = 0;
  private y = 0;

  protected readonly binPath = './resources/win32/nircmd/nircmd.exe';

  click() {
    return this.bin('sendmouse left click');
  }

  async move(x: number, y: number, restart = true) {
    if (restart) {
      await this.moveAway();
    }

    const scaling = this.settings.useScaling ? this.scaling : 1;
    const sX = (x - this.x) / scaling;
    const sY = (y - this.y) / scaling;
    const r = await this.moveRelative(sX, sY);

    this.x = x;
    this.y = y;

    return r;
  }

  moveAway() {
    this.x = 0;
    this.y = 0;

    return this.moveRelative(-9999, -9999);
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`sendkeypress 0x${this.getMappedKey(key)}`);
  }

  private moveRelative(x: number, y: number) {
    return this.bin(`sendmouse move ${x} ${y}`);
  }
}
