import { Command } from 'commander';
import {
  keyBindOption,
  debugLimitOption,
  langOption,
  soundPathOption,
  skipUpdateCheckOption,
  disableSoundOption,
  KeyBindOption,
  DebugLimitOption,
  LangOption,
  SoundPathOption,
  SkipUpdateCheckOption,
  DisableSoundOption,
} from './options';

type Options = KeyBindOption &
  DebugLimitOption &
  LangOption &
  SoundPathOption &
  SkipUpdateCheckOption &
  DisableSoundOption;

const { version, name } = require('../../package.json');

export const program = new Command(name);

program
  .version(version)
  .addOption(keyBindOption)
  .addOption(debugLimitOption)
  .addOption(langOption)
  .addOption(soundPathOption)
  .addOption(skipUpdateCheckOption)
  .addOption(disableSoundOption);

program.parse();

// TODO: override exit?
export const options = program.opts() as Options;
