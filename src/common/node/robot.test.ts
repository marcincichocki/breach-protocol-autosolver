import { BreachProtocolExitStrategy, BreachProtocolResult } from '@/core';
import { BreachProtocolRobot, RobotSettings } from './robot';

describe('robot', () => {
  let robot: BreachProtocolRobot;
  const exitStrategy: BreachProtocolExitStrategy = {
    shouldForceClose: false,
    willExit: true,
  };

  beforeAll(() => {
    robot = new TestRobot({ autoExit: true } as RobotSettings);
    spyOn(robot, 'pressKey');
  });

  it('should work!', async () => {
    const path = ['A4', 'C4', 'C5', 'A5'];

    await robot.resolveBreachProtocolWithKeyboard({
      path,
      exitStrategy,
    } as BreachProtocolResult);

    expect(robot.pressKey).toBeCalledTimes(2);
  });
});

class TestRobot extends BreachProtocolRobot {
  async click() {}
  async move() {}
  async movePointerAway() {}
  async exit() {}
  async pressKey() {}
}
