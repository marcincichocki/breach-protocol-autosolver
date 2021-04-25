import { Option } from 'commander';

const choices = ['jpg', 'png'] as const;

type Format = typeof choices[number];

const defaultValue: Format = 'png';

export interface FormatOption {
  format: Format;
}

const flags = '--format <imageFormat>';
const description = 'Image format to save screenshots with.';

export const formatOption = new Option(flags, description)
  // @ts-ignore
  .choices(choices)
  .default(defaultValue);
