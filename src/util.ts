import minimist from 'minimist';

export function unique<T>(value: T, index: number, array: T[]) {
  return array.indexOf(value) === index;
}

export function swap<T1 = any, T2 = any>([a, b]: readonly [T1, T2]): [
  b: T2,
  a: T1
] {
  return [b, a];
}

// https://stackoverflow.com/a/37580979/4777077
export function permute<T>(permutation: T[]) {
  const { length } = permutation;
  const result = [permutation.slice()];
  const c = Array.from<number>({ length }).fill(0);
  let i = 1;
  let k;
  let p;

  while (i < length) {
    if (c[i] < i) {
      k = i % 2 && c[i];
      p = permutation[i];
      permutation[i] = permutation[k];
      permutation[k] = p;
      ++c[i];
      i = 1;
      result.push(permutation.slice());
    } else {
      c[i] = 0;
      ++i;
    }
  }
  return result;
}

export class Point {
  constructor(public x: number, public y: number) {}
}

export function createLogger(enable = false) {
  return (...args: any[]) => (enable ? console.log.apply(this, args) : null);
}

function parseOptions(args: string[]) {
  const argv = minimist(args, {
    string: ['key-bind', 'debug-limit', 'lang', 'sound-path'],
    boolean: ['skip-update-check', 'disable-sound'],
  });

  // Default key bind: Ctrl+, (Left Ctrl+NumPad Dot)
  // Table with key codes: https://github.com/torvalds/linux/blob/8b12a62a4e3ed4ae99c715034f557eb391d6b196/include/uapi/linux/input-event-codes.h#L65
  let keyBind = [29, 83];
  let debugLimit = 5;
  let skipUpdateCheck = false;
  let lang = 'en';
  let soundPath = 'C:/Windows/Media/Windows Foreground.wav';
  let disableSound = false;

  if (argv['key-bind']) {
    keyBind = argv['key-bind'].split(',').filter(Boolean).map(Number);
  }

  if (argv['debug-limit']) {
    debugLimit = Number(argv['debug-limit']);
  }

  if (argv['skip-update-check']) {
    skipUpdateCheck = argv['skip-update-check'];
  }

  if (argv['lang'] && ['en', 'pl'].includes(argv['lang'])) {
    lang = argv['lang'];
  }

  if (argv['sound-path']) {
    soundPath = argv['sound-path'];
  }

  if (argv['disable-sound']) {
    disableSound = argv['disable-sound'];
  }

  return {
    keyBind,
    debugLimit,
    skipUpdateCheck,
    lang,
    soundPath,
    disableSound,
  };
}

export const options = parseOptions(process.argv.slice(2));
