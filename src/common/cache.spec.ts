import { Cache } from './cache';

describe('Cache decorator', () => {
  it('should cache getter', () => {
    const spy = jest.fn();

    class Test {
      @Cache()
      get prop() {
        return spy();
      }
    }

    const t = new Test();

    t.prop;
    t.prop;

    expect(spy).toBeCalledTimes(1);
  });
});
