import { Option } from 'commander';

export interface AutoExitOption {
  autoExit: boolean;
}

const flags = '--auto-exit';
const description =
  'Whether to automatically close breach protocol after solving it.';

export const autoExitOption = new Option(flags, description).default(true);
