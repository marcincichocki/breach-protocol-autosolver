import { Command } from 'commander';
import {
  AutoExitOption,
  autoExitOption,
  debugLimitOption,
  DebugLimitOption,
  delayOption,
  DelayOption,
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
  ThresholdBufferSize,
  thresholdBufferSizeOption,
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
  ThresholdBufferSize &
  DelayOption &
  AutoExitOption;

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
  .addOption(thresholdBufferSizeOption)
  .addOption(delayOption)
  .addOption(autoExitOption)
  .exitOverride();

export const options = program.opts() as Options;
