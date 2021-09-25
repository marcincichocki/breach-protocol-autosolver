import { BreachProtocolRobot, BreachProtocolRobotKeys } from './robot';

export class XDoToolRobot extends BreachProtocolRobot {
  protected readonly binPath = 'xdotool';

  getMappedKey(key: BreachProtocolRobotKeys) {
    return '';
  }

  move(x: number, y: number) {
    return this.bin(`mousemove ${x} ${y}`);
  }

  moveAway() {
    return this.move(0, 0);
  }

  click() {
    return this.bin('click 1');
  }

  pressKey(key: BreachProtocolRobotKeys) {
    return this.bin(`key ${this.getMappedKey(key)}`);
  }
}
