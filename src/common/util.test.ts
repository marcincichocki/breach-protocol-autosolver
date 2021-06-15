import {
  BitMask,
  chunk,
  getClosest,
  memoize,
  unique,
  uniqueBy,
  uniqueWith,
} from './util';

describe('utils', () => {
  it('should create chunks', () => {
    expect(chunk('abcdef', 2)).toEqual(['ab', 'cd', 'ef']);
    expect(chunk('abcdef', 3)).toEqual(['abc', 'def']);
    expect(chunk('abcdef', 4)).toEqual(['abcd', 'ef']);
  });

  it('should memo provided function', () => {
    const test = jest.fn((n: number) => n);
    const memozedTest = memoize(test);

    const r1 = memozedTest(42);

    expect(r1).toBe(42);
    expect(test).toBeCalledTimes(1);

    const r2 = memozedTest(42);

    expect(r2).toBe(42);
    expect(test).toBeCalledTimes(1);
  });

  it('should produce unique list', () => {
    expect([1, 2, 1, 1].filter(unique)).toEqual([1, 2]);
    expect(['abc', 'abcd', 'abc'].filter(unique)).toEqual(['abc', 'abcd']);
  });

  it('should produce unique list by property name', () => {
    const data = [{ a: 0 }, { a: 4 }, { a: 0 }];
    const d1 = data.filter(uniqueBy('a'));

    expect(d1.length).toBe(2);
    expect(d1.map((x) => x.a)).toEqual([0, 4]);
  });

  it('should produce unique list by function', () => {
    const data = [{ a: [0, 1] }, { a: [2, 3] }, { a: [0, 1] }];
    const d1 = data.filter(uniqueWith((o) => o.a.join()));

    expect(d1.length).toBe(2);
    expect(d1.map((x) => x.a)).toEqual([
      [0, 1],
      [2, 3],
    ]);
  });

  it('should find closest number', () => {
    expect(getClosest(4, [1, 5])).toBe(5);
    expect(getClosest(900, [720, 1080, 1440])).toBe(720);
  });

  it('should correctly recognize flags in bit mask', () => {
    const mask = new BitMask(4); // 100

    // M 100
    // F 000
    expect(mask.has(0)).toBe(false);

    mask.add(1);

    // M 101
    // F 111
    expect(mask.has(7)).toBe(true);

    mask.delete(3);

    // M 010
    // F 000
    expect(mask.has(0)).toBe(false);

    const m2 = new BitMask(0);

    // M 000
    // F 001
    expect(m2.has(1)).toBe(false);
  });
});
