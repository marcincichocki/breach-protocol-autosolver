import { AppSettings } from './common';

class BreachProtocolOption<T = any> {
  constructor(
    public readonly name: string,
    public readonly description: string,
    public readonly defaultValue: T
  ) {}
}

const options = [
  new BreachProtocolOption<string>(
    'activeDisplayId',
    'Select monitor on which Cyberpunk 2077 is running.',
    null
  ),
  new BreachProtocolOption(
    'autoUpdate',
    'Update autosolver automatically.',
    true
  ),
  new BreachProtocolOption(
    'delay',
    'Delay in milliseconds between output clicks.',
    75
  ),
  new BreachProtocolOption(
    'autoExit',
    'Automatically exit breach protocol after solving it.',
    true
  ),
  new BreachProtocolOption(
    'soundEnabled',
    'Disable/enable sound effects.',
    true
  ),
  new BreachProtocolOption(
    'experimentalBufferSizeRecognition',
    'Use experimental buffer size recognition. Recommended for very high in game gamma(above 1.5).',
    false
  ),
  new BreachProtocolOption(
    'format',
    'Format in which save source images. "png" offers better quality, but takes more space on disk.',
    'png'
  ),
  new BreachProtocolOption(
    'historySize',
    'Amount of history entires saved.',
    10
  ),
  new BreachProtocolOption(
    'keyBind',
    'Key bind which triggers autosolver. Press "Enter" to save new key bind, or "Escape" to cancel.',
    'CommandOrControl+numdec'
  ),
  new BreachProtocolOption(
    'preserveSourceOnSuccess',
    'Preserve image source after successful breach protocol. This might take a lot of space depending on format and history size options.',
    false
  ),
  new BreachProtocolOption(
    'checkForUpdates',
    'Check for updates on startup.',
    true
  ),
  new BreachProtocolOption(
    'errorSoundPath',
    'Path to error sound.',
    'C:/Windows/Media/Windows Foreground.wav'
  ),
  new BreachProtocolOption(
    'thresholdBufferSize',
    'Fixed threshold value for buffer size fragment.',
    127
  ),
  new BreachProtocolOption(
    'thresholdBufferSizeAuto',
    'Use automatic threshold for buffer size fragment.',
    true
  ),
  new BreachProtocolOption(
    'thresholdDaemons',
    'Fixed threshold value for daemons fragment.',
    127
  ),
  new BreachProtocolOption(
    'thresholdDaemonsAuto',
    'Use automatic threshold for daemons fragment.',
    true
  ),
  new BreachProtocolOption(
    'thresholdGrid',
    'Fixed threshold value for grid fragment.',
    127
  ),
  new BreachProtocolOption(
    'thresholdGridAuto',
    'Use automatic threshold for grid fragment.',
    true
  ),
  new BreachProtocolOption(
    'useScaling',
    'Use Windows scaling to calculate coordinates of squares.',
    false
  ),
];

function reduceOptions<T>(
  options: BreachProtocolOption[],
  cb: (option: BreachProtocolOption) => T
) {
  return options.reduce(
    (options, option) => ({
      ...options,
      [option.name]: cb(option),
    }),
    {} as Record<keyof AppSettings, T>
  );
}

export const defaultOptions = reduceOptions(
  options,
  ({ defaultValue }) => defaultValue
) as AppSettings;

export const optionsDescription = reduceOptions(
  options,
  ({ description }) => description
);
