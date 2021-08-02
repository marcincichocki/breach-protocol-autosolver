import { AppSettings } from './common';

interface BreachProtocolOption {
  id: keyof AppSettings;
  description: string;
  defaultValue: boolean | string | number;
}

const options: BreachProtocolOption[] = [
  {
    id: 'activeDisplayId',
    description: 'Select monitor on which Cyberpunk 2077 is running.',
    defaultValue: null,
  },
  {
    id: 'autoUpdate',
    description: 'Update autosolver automatically.',
    defaultValue: true,
  },
  {
    id: 'delay',
    description: 'Delay in milliseconds between output clicks.',
    defaultValue: 75,
  },
  {
    id: 'autoExit',
    description: 'Automatically exit breach protocol after solving it.',
    defaultValue: true,
  },
  {
    id: 'soundEnabled',
    description: 'Disable/enable sound effects.',
    defaultValue: BUILD_PLATFORM === 'win32',
  },
  {
    id: 'experimentalBufferSizeRecognition',
    description:
      'Use experimental buffer size recognition. Recommended for very high in game gamma(above 1.5).',
    defaultValue: false,
  },
  {
    id: 'format',
    description:
      'Format in which save source images. "png" offers better quality, but takes more space on disk.',
    defaultValue: 'png',
  },
  {
    id: 'historySize',
    description: 'Amount of history entires saved.',
    defaultValue: 3,
  },
  {
    id: 'keyBind',
    description:
      'Key bind which triggers autosolver. Press "Enter" to save new key bind, or "Escape" to cancel.',
    defaultValue: 'Alt+`',
  },
  {
    id: 'preserveSourceOnSuccess',
    description:
      'Preserve image source after successful breach protocol. This might take a lot of space depending on format and history size options.',
    defaultValue: true,
  },
  {
    id: 'checkForUpdates',
    description: 'Check for updates on startup.',
    defaultValue: true,
  },
  {
    id: 'errorSoundPath',
    description: 'Path to error sound.',
    defaultValue:
      BUILD_PLATFORM === 'win32'
        ? 'C:/Windows/Media/Windows Foreground.wav'
        : '',
  },
  {
    id: 'thresholdBufferSize',
    description: 'Fixed threshold value for buffer size fragment.',
    defaultValue: 127,
  },
  {
    id: 'thresholdBufferSizeAuto',
    description: 'Use automatic threshold for buffer size fragment.',
    defaultValue: true,
  },
  {
    id: 'thresholdDaemons',
    description: 'Fixed threshold value for daemons fragment.',
    defaultValue: 127,
  },
  {
    id: 'thresholdDaemonsAuto',
    description: 'Use automatic threshold for daemons fragment.',
    defaultValue: true,
  },
  {
    id: 'thresholdGrid',
    description: 'Fixed threshold value for grid fragment.',
    defaultValue: 127,
  },
  {
    id: 'thresholdGridAuto',
    description: 'Use automatic threshold for grid fragment.',
    defaultValue: true,
  },
  {
    id: 'useScaling',
    description: 'Use Windows scaling to calculate coordinates of squares.',
    defaultValue: false,
  },
  {
    id: 'minimizeToTray',
    description: 'Minimize app to system tray.',
    defaultValue: false,
  },
  {
    id: 'outputDevice',
    description: 'Output device that will be used to solve breach protocol.',
    defaultValue: 'mouse',
  },
  {
    id: 'engine',
    description: 'Program that will send mouse clicks or key strokes to OS.',
    defaultValue: BUILD_PLATFORM === 'win32' ? 'nircmd' : 'xdotool',
  },
  {
    id: 'ahkBinPath',
    description: 'Path to AutoHotkey executable.',
    defaultValue: '',
  },
];

function optionsToObject<T>(cb: (option: BreachProtocolOption) => T) {
  const entries = options.map((o) => [o.id, cb(o)]);

  return Object.fromEntries(entries);
}

export const defaultOptions: AppSettings = optionsToObject(
  (o) => o.defaultValue
);

export const optionsDescription: Record<keyof AppSettings, string> =
  optionsToObject((o) => o.description);
