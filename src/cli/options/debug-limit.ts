import { InvalidOptionArgumentError, Option } from 'commander';

export function parser(value: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue <= 0) {
    throw new InvalidOptionArgumentError('Must be positive integer.');
  }

  return parsedValue;
}

export interface DebugLimitOption {
  debugLimit: number;
}

const flags = '--debug-limit <n>';
const description = 'Maximum number of debug elemnts saved.';

export const debugLimitOption = new Option(flags, description)
  .argParser(parser)
  .default(5);
