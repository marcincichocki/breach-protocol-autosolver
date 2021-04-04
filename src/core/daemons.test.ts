import registry from '../bp-registry/registry.json';
import { BufferSize, byBufferSize, HexNumber } from './common';
import { Daemon, sequenceFrom, Sequence, makeSequences } from './sequence';
import { permute, unique } from '../common';

describe('new daemons logic', () => {
  it('shuold work', () => {
    // NOTE: if daemons are incorrect they will be ignored.
    // prettier-ignore
    const sequences = makeSequences(
      [
        ['1C', '1C'],
        ['1C', '1C', '1C'], 
        ['1C'],
        ['7A', 'BD'],
      ],
      8
    );
  });
});
