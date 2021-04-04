import { Option } from 'commander';
import { thresholdParser as parser } from './common';

export interface ThresholdBuffer {
  thresholdBuffer: number;
}

const flags = '--theshold-buffer <n>';
const description =
  'Value in the range 0-255 representing the level at which the threshold will be applied to buffer image fragment.';

export const thresholdBufferOption = new Option(flags, description).argParser(
  parser
);
