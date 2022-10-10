import { memoize } from '@/common';

export function findOverlap(s1: string, s2: string) {
  const l = s1.length;
  let i = Math.min(s1.length, s2.length);

  while (--i) {
    const a = s1.substring(l - i, l);
    const b = s2.substring(0, i);

    if (a === b) {
      return s1 + s2.substring(i);
    }
  }

  return s1 + s2;
}

export const memoizedFindOverlap = memoize(findOverlap);
