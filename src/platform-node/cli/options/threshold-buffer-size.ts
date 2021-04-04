import { Option } from 'commander';
import { thresholdParser as parser } from './common';

export interface ThresholdBufferSize {
  thresholdBufferSize: number;
}

const flags = '--theshold-buffer-size <n>';
const description =
  'Value in the range 0-255 representing the level at which the threshold will be applied to buffer size image fragment.';

export const thresholdBufferSizeOption = new Option(
  flags,
  description
).argParser(parser);
