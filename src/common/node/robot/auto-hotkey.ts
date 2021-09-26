import { sleep } from '@/common/util';
import { BreachProtocolRobotKeys } from './robot';
import { WindowsRobot } from './win32';

export class AutoHotkeyRobot extends WindowsRobot {
  protected readonly binPath = this.settings.ahkBinPath;
  private readonly scriptPath = './resources/win32/ahk/robot.ahk';

  // Autohotkey sends wrong scan code to GeForceNow 0x4B instead of 0x14B
  // causing it to recive wrong keys. This object defines fallback to use.
  private readonly vkeyFallback: Record<string, string> = {
    25: 'Left',
    26: 'Up',
    27: 'Right',
    28: 'Down',
  };

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
    const vkey = this.getMappedKey(key);
    const keyCode =
      vkey in this.vkeyFallback ? this.vkeyFallback[vkey] : `vk0x${vkey}`;

    return this.bin(`send ${keyCode}`);
  }
}
