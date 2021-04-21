import { Command } from 'commander';
import {
  debugLimitOption,
  DebugLimitOption,
  delayOption,
  DelayOption,
  disableAutoExitOption,
  DisableAutoExitOption,
  disableSoundOption,
  DisableSoundOption,
  experimentalBufferSizeRecognition,
  ExperimentalBufferSizeRecognitionOption,
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
  UseScalingOption,
  useScalingOption,
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
  DisableAutoExitOption &
  UseScalingOption &
  ExperimentalBufferSizeRecognitionOption;

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
  .addOption(disableAutoExitOption)
  .addOption(useScalingOption)
  .addOption(experimentalBufferSizeRecognition)
  .exitOverride();

export const options = program.opts() as Options;
