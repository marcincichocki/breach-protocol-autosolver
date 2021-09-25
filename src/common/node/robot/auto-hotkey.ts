import { sleep } from '@/common/util';
import { BreachProtocolRobotKeys } from './robot';
import { WindowsRobot } from './win32';

export class AutoHotkeyRobot extends WindowsRobot {
  protected readonly binPath = this.settings.ahkBinPath;
  private readonly scriptPath = './resources/win32/ahk/robot.ahk';

  override async bin(command: string) {
    const args = [this.scriptPath, ...command.split(' ')];
    const data = await this.execBin(args);
    await sleep(this.settings.delay);

    return data;
  }

  move(x: number, y: number) {
    return this.bin(`move ${x} ${y}`);
  }

  moveAway() {
    return this.bin('reset');
  }

  click() {
    return this.bin('click');
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`send 0x${this.getMappedKey(key)}`);
  }
}
