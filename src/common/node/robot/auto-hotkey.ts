import { sleep } from '@/common/util';
import { BreachProtocolRobot, BreachProtocolRobotKeys } from './robot';

export class AutoHotkeyRobot extends BreachProtocolRobot {
  protected readonly binPath = this.settings.ahkBinPath;
  private readonly scriptPath = './resources/win32/ahk/robot.ahk';

  getMappedKey(key: BreachProtocolRobotKeys) {
    return '';
  }

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
    return this.bin(`send ${this.getMappedKey(key)}`);
  }
}
