import { Option } from 'commander';

const flags = '--skip-update-check';
const description = 'Whether to disable update check.';

export interface SkipUpdateCheckOption {
  skipUpdateCheck: boolean;
}

export const skipUpdateCheckOption = new Option(flags, description).default(
  false
);
