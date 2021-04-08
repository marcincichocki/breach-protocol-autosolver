import { Option } from 'commander';

export interface DisableAutoExitOption {
  disableAutoExit: boolean;
}

const flags = '--disable-auto-exit';
const description =
  'Disable automatic closing of breach protocol after solving it.';

export const disableAutoExitOption = new Option(flags, description).default(
  false
);
