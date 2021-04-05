import { Option } from 'commander';
import { thresholdParser as parser } from './common';

export interface ThresholdGrid {
  thresholdGrid: number;
}

const flags = '--threshold-grid <n>';
const description =
  'Value in the range 0-255 representing the level at which the threshold will be applied to grid image fragment.';

export const thresholdGridOption = new Option(flags, description).argParser(
  parser
);
