import { InvalidOptionArgumentError } from 'commander';

export function thresholdParser(value: string) {
  const min = 0;
  const max = 255;

  return rangeParser(value, min, max);
}

export function rangeParser(value: string, min: number, max: number) {
  const parsedValue = Number.parseInt(value, 10);

  if (Number.isNaN(parsedValue) || parsedValue < min || parsedValue > max) {
    throw new InvalidOptionArgumentError(
      `Must be integer in range ${min}-${max}.`
    );
  }

  return parsedValue;
}
