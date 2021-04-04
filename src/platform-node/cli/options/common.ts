import { InvalidOptionArgumentError } from 'commander';

export function thresholdParser(value: string) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < 0 || parsedValue > 255) {
    throw new InvalidOptionArgumentError('Must be integer in range 0-255.');
  }

  return parsedValue;
}
