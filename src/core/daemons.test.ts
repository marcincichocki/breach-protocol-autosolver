import registry from '../bp-registry/registry.json';
import { BufferSize, byBufferSize, HexNumber } from './common';
import { Daemon, sequenceFrom, Sequence2, makeSequences } from './daemons';
import { permute, unique } from '../common';

const ocrData = registry['3840x2160'][3];

describe('new daemons logic', () => {
  it('shuold work', () => {
    // const daemons = ocrData.daemons.map(
    //   // look up full overlaps here?
    //   (d, i) => new Daemon(d as HexNumber[], i)
    // );

    // those are daemons that are full overlaps of other daemons
    // we don't use them in permutations
    // TODO: check what happen if there is more than one the same.
    // const childSequences: Sequence2[] = [];

    // const daemonsWithChildren = daemons.filter((s, i, a) => {
    //   return !a.some((s2, i2) => {
    //     const isIndexSame = i === i2;
    //     const isValueSame = s2.tValue.includes(s.tValue);

    //     if (!isIndexSame && isValueSame) {
    //       a[i2].children = [s];
    //       childSequences.push(sequenceFrom([s]));
    //       // childSequences.push(new Sequence2(a[i].value, [a[i]]));

    //       return true;
    //     }

    //     return false;
    //   });
    // });

    // console.log(daemons);

    // console.log(daemonsWithChildren);

    // const permutations = permute(daemonsWithChildren);
    // const permutationsWithParts = permutations.flatMap((p) =>
    //   p.map((x, i) => p.slice(0, i + 1))
    // );

    // const sequences = permutationsWithParts
    //   .map(sequenceFrom)
    //   .concat(childSequences)
    //   .filter((s) => s.length <= ocrData.bufferSize)
    //   .sort((s1, s2) => {
    //     const byParts = s2.parts.length - s1.parts.length;
    //     const byLength = s1.value.length - s2.value.length;
    //     const byStrength = s2.strength - s1.strength;

    //     return byStrength || byLength;
    //   });

    // prettier-ignore
    const sequences = makeSequences(
      [
        ['BD', '1C', '1C'], 
        ['1C', '7A'],
        ['E9', 'E9'],
      ],
      8
    );

    console.log(sequences);
  });
});
