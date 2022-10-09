import {
  cross,
  generateSquareMap,
  getRegularGap,
  getShortestGap,
  getUnits,
} from './common';

describe('utilities', () => {
  it('should combine 2 strings', () => {
    const a = 'ab';
    const b = '12';
    const result = cross(a, b);

    expect(result).toEqual(['a1', 'a2', 'b1', 'b2']);
    expect(result.length).toBe(a.length * b.length);
  });

  it('should return array of units in correct order', () => {
    const result = getUnits('abc', '123');

    expect(result).toEqual([
      ['a1', 'a2', 'a3'],
      ['b1', 'b2', 'b3'],
      ['c1', 'c2', 'c3'],
      ['a1', 'b1', 'c1'],
      ['a2', 'b2', 'c2'],
      ['a3', 'b3', 'c3'],
    ]);

    const b2Units = result.filter((u) => u.includes('b2'));

    expect(b2Units).toEqual([
      ['b1', 'b2', 'b3'], // row
      ['a2', 'b2', 'c2'], // col
    ]);
  });

  it('should generate square map with correct values', () => {
    const squares = cross('ab', '12');
    const result = generateSquareMap(squares, (squre, index) => {
      if (squre === 'b2') {
        return 42;
      }

      return index;
    });

    expect(result.get('a1')).toBe(0);
    expect(result.get('a2')).toBe(1);
    expect(result.get('b1')).toBe(2);
    expect(result.get('b2')).toBe(42);
    expect(result.size).toBe(squares.length);
  });

  it('should generate correct gap between squares', () => {
    expect(getRegularGap('A1', 'A7')).toEqual({
      offset: 6,
      orientation: 'horizontal',
      dir: 'right',
    });

    expect(getRegularGap('C6', 'C5')).toEqual({
      offset: -1,
      orientation: 'horizontal',
      dir: 'left',
    });

    expect(getRegularGap('A6', 'D6')).toEqual({
      offset: 3,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getRegularGap('G2', 'C2')).toEqual({
      offset: -4,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getRegularGap('A1', 'A1')).toEqual(null);
  });

  it('should find shortest gap', () => {
    expect(getShortestGap('A1', 'E1', 7)).toEqual({
      offset: -3,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('A1', 'A4', 4)).toEqual({
      offset: -1,
      orientation: 'horizontal',
      dir: 'left',
    });

    expect(getShortestGap('C1', 'E1', 7)).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('E1', 'C1', 7)).toEqual({
      offset: -2,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('E1', 'B1', 5)).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('B1', 'E1', 5)).toEqual({
      offset: -2,
      orientation: 'vertical',
      dir: 'top',
    });

    expect(getShortestGap('A1', 'A5', 6, ['2', '3', '4'])).toEqual({
      offset: 1,
      orientation: 'horizontal',
      dir: 'right',
    });

    expect(getShortestGap('G1', 'D1', 7, ['A', 'B'])).toEqual({
      offset: 2,
      orientation: 'vertical',
      dir: 'bottom',
    });

    expect(getShortestGap('B4', 'B1', 5, ['4'])).toEqual({
      offset: 2,
      orientation: 'horizontal',
      dir: 'right',
    });
  });
});
