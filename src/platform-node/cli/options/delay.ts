import { Option } from 'commander';
import { rangeParser } from './common';

const defaultValue = 20;

export function parser(value: string) {
  const min = defaultValue;
  const max = 1000;

  return rangeParser(value, min, max);
}

export interface DelayOption {
  delay: number;
}

const flags = '--delay <n>';
const description =
  'Time in miliseconds to wait before each click when solving breach protocol.';

export const delayOption = new Option(flags, description)
  .argParser(parser)
  .default(defaultValue);
