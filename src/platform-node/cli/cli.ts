import { Command } from 'commander';
import {
  debugLimitOption,
  DebugLimitOption,
  disableSoundOption,
  DisableSoundOption,
  keyBindOption,
  KeyBindOption,
  langOption,
  LangOption,
  skipUpdateCheckOption,
  SkipUpdateCheckOption,
  soundPathOption,
  SoundPathOption,
  ThresholdBuffer,
  thresholdBufferOption,
  ThresholdDaemons,
  thresholdDaemonsOption,
  ThresholdGrid,
  thresholdGridOption,
} from './options';

type Options = KeyBindOption &
  DebugLimitOption &
  LangOption &
  SoundPathOption &
  SkipUpdateCheckOption &
  DisableSoundOption &
  ThresholdDaemons &
  ThresholdGrid &
  ThresholdBuffer;

const { version, name } = require('../../../package.json');

export const program = new Command(name)
  .version(version)
  .addOption(keyBindOption)
  .addOption(debugLimitOption)
  .addOption(langOption)
  .addOption(soundPathOption)
  .addOption(skipUpdateCheckOption)
  .addOption(disableSoundOption)
  .addOption(thresholdDaemonsOption)
  .addOption(thresholdGridOption)
  .addOption(thresholdBufferOption)
  .exitOverride();

export const options = program.opts() as Options;
