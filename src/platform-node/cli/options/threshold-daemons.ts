import { Option } from 'commander';
import { thresholdParser as parser } from './common';

export interface ThresholdDaemons {
  thresholdDaemons: number;
}

const flags = '--theshold-daemons <n>';
const description =
  'Value in the range 0-255 representing the level at which the threshold will be applied to daemons image fragment.';

export const thresholdDaemonsOption = new Option(flags, description).argParser(
  parser
);
