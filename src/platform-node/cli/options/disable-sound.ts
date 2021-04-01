import { Option } from 'commander';

export interface DisableSoundOption {
  disableSound: boolean;
}

const flags = '--disable-sound';
const description = 'Disable error sound effect.';

export const disableSoundOption = new Option(flags, description).default(false);
