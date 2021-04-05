import { parser as keyBindParser } from './key-bind';
import { parser as debugLimitParser } from './debug-limit';
import { thresholdParser } from './common';

describe('flag parsers', () => {
  it('should parse and validate --key-bind flag', () => {
    expect(() => keyBindParser('NaN')).toThrow();
    expect(() => keyBindParser('-1')).toThrow();
    expect(() => keyBindParser('0')).toThrow();
    expect(() => keyBindParser('test')).toThrow();
    expect(() => keyBindParser(',,')).toThrow();

    expect(keyBindParser('2')).toEqual([2]);
    expect(keyBindParser('2,3')).toEqual([2, 3]);
  });

  it('should parse and valide --debug-limit flag', () => {
    expect(() => debugLimitParser('NaN')).toThrow();
    expect(() => debugLimitParser('-1')).toThrow();
    expect(() => debugLimitParser('0')).toThrow();
    expect(() => debugLimitParser('test')).toThrow();

    expect(debugLimitParser('1')).toBe(1);
  });

  it('should parse and validate threshold flags', () => {
    expect(() => thresholdParser('NaN')).toThrow();
    expect(() => thresholdParser('test')).toThrow();
    expect(() => thresholdParser('-1')).toThrow();
    expect(() => thresholdParser('256')).toThrow();

    expect(thresholdParser('255')).toBe(255);
    expect(thresholdParser('0')).toBe(0);
  });
});
