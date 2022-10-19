import { DaemonsRawData } from '../common';
import { Daemon } from './daemon';
import { Sequence } from './sequence';

describe('Sequence', () => {
  it('should have breaks between daemons if there is no overlap', () => {
    const rawData: DaemonsRawData = [
      ['1C', '1C'],
      ['55', '7A'],
    ];
    const sequence = Sequence.fromPermutation(Daemon.parse(rawData));

    expect(sequence.breaks).toEqual([0, 2]);
  });

  it('should not have break at overlap', () => {
    const rawData: DaemonsRawData = [
      ['1C', '1C'],
      ['1C', '7A'],
      ['BD', 'BD'],
    ];
    const sequence = Sequence.fromPermutation(Daemon.parse(rawData));

    expect(sequence.breaks).toEqual([0, 3]);
  });

  it('should not create breaks for child daemons and regular daemons', () => {
    const rawData: DaemonsRawData = [
      ['BD', 'BD', 'BD'],
      ['BD', '1C', 'BD'],
      ['BD', 'BD'],
    ];
    const [d1, d2, d3] = Daemon.parse(rawData);
    const sequence = Sequence.fromPermutation([d1, d2]);

    expect(d3.isChild).toBe(true);
    expect(sequence.breaks).toEqual([0]);
  });
});
