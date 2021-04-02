import { chunk } from './util';

describe('utils', () => {
  it('should create chunks', () => {
    expect(chunk('abcdef', 2)).toEqual(['ab', 'cd', 'ef']);
    expect(chunk('abcdef', 3)).toEqual(['abc', 'def']);
    expect(chunk('abcdef', 4)).toEqual(['abcd', 'ef']);
  });
});
