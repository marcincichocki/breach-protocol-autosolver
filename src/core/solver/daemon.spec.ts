import { Daemon } from './daemon';

describe('Daemon parse', () => {
  it('should not create any relations', () => {
    const daemons = Daemon.parse([
      ['1C', '1C'],
      ['55', '7A'],
    ]);
    const [p1, p2] = daemons.map((d) => d.getParts());

    expect(daemons.every((d) => !d.isChild)).toBeTruthy();
    expect(daemons.every((d) => !d.isParent)).toBeTruthy();
    expect(p1.length).toBe(1);
    expect(p2.length).toBe(1);
    expect(p1[0]).toEqual(daemons[0]);
    expect(p2[0]).toEqual(daemons[1]);
  });

  it('should mark one daemon as a child', () => {
    const [d1, d2] = Daemon.parse([
      ['1C', '55', 'BD'],
      ['55', 'BD'],
    ]);
    expect(d1.isParent).toBeTruthy();
    expect(d1.getParts()[1]).toEqual(d2);
    expect(d2.isChild).toBeTruthy();
  });

  it('should mark daemons as children of multiple parents', () => {
    const [d1, d2, d3, d4, d5] = Daemon.parse([
      ['55', '55', '55'], // Parent of d2, d5
      ['55'], // Child of d1, d4, d5
      ['BD', 'FF'], // Child of d4
      ['BD', 'FF', '55'], // Parent of d2, d3
      ['55', '55'], // Child of d1
    ]);

    expect(d1.isParent).toBe(true);
    expect(d1.getParts()).toEqual([d1, d2, d5]);

    expect(d2.isChild).toBe(true);
    expect(d2.isParent).toBe(false);

    expect(d3.isChild).toBe(true);
    expect(d3.isParent).toBe(false);

    expect(d4.isParent).toBe(true);
    expect(d4.getParts()).toEqual([d4, d2, d3]);

    expect(d5.isChild).toBe(true);
    expect(d5.isParent).toBe(false);
  });
});
