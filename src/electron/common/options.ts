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
    description: 'Update app automatically when new version is found.',
    defaultValue: false,
  },
  {
    id: 'delay',
    description: 'Delay in milliseconds between output commands.',
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
      'Source image format. Use png for better quality, or jpg for better performance.',
    defaultValue: 'png',
  },
  {
    id: 'historySize',
    description: 'Amount of entries in history.',
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
    description: 'Preserve source image after successful breach protocol.',
    defaultValue: true,
  },
  {
    id: 'checkForUpdates',
    description: 'Check for updates on startup.',
    defaultValue: true,
  },
  {
    id: 'errorSoundPath',
    description: 'Sound played when error occured during recognition.',
    defaultValue:
      BUILD_PLATFORM === 'win32'
        ? 'C:/Windows/Media/Windows Foreground.wav'
        : '',
  },
  {
    id: 'startSoundPath',
    description: 'Sound played at the start of the job.',
    defaultValue: '',
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
    description:
      'Take display scaling into account when calculating coordinates of squares. Applies only to mouse output.',
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
    defaultValue: 'keyboard',
  },
  {
    id: 'engine',
    description: 'Program that will send output commands to Cyberpunk 2077.',
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
