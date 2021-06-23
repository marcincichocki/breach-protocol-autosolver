import {
  BreachProtocolKeyboardResolver,
  BreachProtocolResolver,
} from './resolver';
import {
  BreachProtocolRobot,
  BreachProtocolRobotKeys,
  RobotSettings,
} from './robot';

describe('resolvers', () => {
  let robot: BreachProtocolRobot;
  let keyboardResolver: BreachProtocolResolver;
  let spy: jest.SpyInstance;

  beforeAll(() => {
    robot = new TestRobot({ delay: 0 } as RobotSettings);
    keyboardResolver = new BreachProtocolKeyboardResolver(robot);

    spy = jest.spyOn(robot, 'pressKey');
  });

  afterEach(() => {
    spy.mockClear();
  });

  it('should press keys correct amount of times', async () => {
    await keyboardResolver.resolve(['A3', 'C3', 'C2', 'A2', 'A4']);

    // init     +2
    // A1 -> A3 +3
    // A3 -> C3 +3
    // C3 -> C2 +2
    // C2 -> A2 +3
    // A2 -> A4 +2
    expect(robot.pressKey).toBeCalledTimes(15);
  });

  it('should press keys correct ammount of times with when going backwards', async () => {
    // init     +2
    // A1 -> A1 +1
    // A1 -> E1 +5
    // E1 -> E6 +6
    // E6 -> G6 +3
    // G6 -> G1 +6
    // G1 -> B1 +5
    await keyboardResolver.resolve(['A1', 'E1', 'E6', 'G6', 'G1', 'B1']);

    expect(robot.pressKey).toBeCalledTimes(28);
  });
});

class TestRobot extends BreachProtocolRobot {
  keys = {} as Record<BreachProtocolRobotKeys, string>;

  async click() {}
  async move() {}
  async pressKey() {}
  async moveAway() {}
}
