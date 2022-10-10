import { DaemonsRawData } from '../common';
import { Daemon } from './daemon';
import { Sequence } from './sequence';

describe('Sequence', () => {
  it('should have breaks between daemons if there is no overlap', () => {
    const rawData: DaemonsRawData = [
      ['1C', '1C'],
      ['55', '7A'],
    ];
    const sequence = new Sequence(
      ['1C', '1C', '55', '7A'],
      Daemon.parse(rawData)
    );

    expect(sequence.breaks).toEqual([0, 2]);
  });

  it('should not have break at overlap', () => {
    const rawData: DaemonsRawData = [
      ['1C', '1C'],
      ['1C', '7A'],
      ['BD', 'BD'],
    ];
    const sequence = new Sequence(
      ['1C', '1C', '7A', 'BD', 'BD'],
      Daemon.parse(rawData)
    );

    expect(sequence.breaks).toEqual([0, 3]);
  });

  it('should have only one break at the start if there is a full overlap', () => {
    const rawData: DaemonsRawData = [
      ['1C', '1C'],
      ['1C', '1C', '7A'],
    ];
    const daemons = Daemon.parse(rawData);
    const sequence = new Sequence(
      ['1C', '1C', '7A'],
      daemons.filter(({ index }) => index === 1)
    );

    expect(daemons[0].isChild).toBe(true);
    expect(sequence.breaks).toEqual([0]);
  });
});
