import {
  BreachProtocolKeyboardResolver,
  BreachProtocolResolver,
} from './resolver';
import {
  BreachProtocolRobot,
  BreachProtocolRobotKeys,
  RobotSettings,
} from './robot';

describe('Resolvers', () => {
  let robot: BreachProtocolRobot;
  let resolver: BreachProtocolResolver;

  beforeAll(() => {
    robot = new TestRobot({ delay: 0 } as RobotSettings);
    resolver = new BreachProtocolKeyboardResolver(robot);

    spyOn(robot, 'pressKey');
  });

  it('should press keys correct amount of times', async () => {
    await resolver.resolve(['A3', 'C3', 'C2', 'A2', 'A4']);

    // init     +2
    // A1 -> A3 +3
    // A3 -> C3 +3
    // C3 -> C2 +2
    // C2 -> A2 +3
    // A2 -> A4 +2
    expect(robot.pressKey).toBeCalledTimes(15);
  });
});

class TestRobot extends BreachProtocolRobot {
  keys = {} as Record<BreachProtocolRobotKeys, string>;

  async click() {}
  async move() {}
  async pressKey() {}
  async moveAway() {}
}
