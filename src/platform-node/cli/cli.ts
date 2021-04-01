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

// TODO: add absolute path to root
const { version, name } = require('../../../package.json');

export const program = new Command(name)
  .version(version)
  .addOption(keyBindOption)
  .addOption(debugLimitOption)
  .addOption(langOption)
  .addOption(soundPathOption)
  .addOption(skipUpdateCheckOption)
  .addOption(disableSoundOption)
  .exitOverride();

export const options = program.opts() as Options;
