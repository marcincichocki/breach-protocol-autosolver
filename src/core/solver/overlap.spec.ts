import { findOverlap } from './overlap';

describe('String overlap', () => {
  const entries = [
    { s1: '121', s2: '345', expected: '121345' }, // 1) no overlap
    { s1: '222', s2: '2211', expected: '22211' }, // 2) two overlaps in start dir
    { s1: '2211', s2: '111', expected: '22111' }, // 3) two overlaps in end dir
    { s1: '123', s2: '345', expected: '12345' }, // 4) standard same start end
    { s1: '543', s2: '321', expected: '54321' }, // 5) standard same end start
  ];

  it.each(entries)(
    'should find correct overlap for $s1 and $s2',
    ({ s1, s2, expected }) => {
      expect(findOverlap(s1, s2)).toEqual(expected);
    }
  );
});
