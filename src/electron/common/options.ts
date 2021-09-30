import {
  VK_ARROW_DOWN,
  VK_ARROW_LEFT,
  VK_ARROW_RIGHT,
  VK_ARROW_UP,
  VK_ENTER,
  VK_ESCAPE,
} from '@/common';
import { AppSettings } from './common';

interface BreachProtocolOption {
  id: keyof AppSettings;
  description: string;
  defaultValue: boolean | string | number;
}

export const options: BreachProtocolOption[] = [
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
    description: 'Delay in milliseconds between input commands.',
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
      'Solve breach protocol(prioritize daemons that are lower on the list).',
    defaultValue: 'Alt+`',
  },
  {
    id: 'keyBindWithPriority1',
    description: 'Solve breach protocol(prioritize first daemon).',
    defaultValue: 'Alt+1',
  },
  {
    id: 'keyBindWithPriority2',
    description: 'Solve breach protocol(prioritize second daemon).',
    defaultValue: 'Alt+2',
  },
  {
    id: 'keyBindWithPriority3',
    description: 'Solve breach protocol(prioritize third daemon).',
    defaultValue: 'Alt+3',
  },
  {
    id: 'keyBindWithPriority4',
    description: 'Solve breach protocol(prioritize fourth daemon).',
    defaultValue: 'Alt+4',
  },
  {
    id: 'keyBindWithPriority5',
    description: 'Solve breach protocol(prioritize fifth daemon).',
    defaultValue: 'Alt+5',
  },
  {
    id: 'keyBindAnalyze',
    description: 'Analyze breach protocol and display available sequences.',
    defaultValue: '',
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
      'Take display scaling into account when calculating coordinates of squares. Applies only to mouse input.',
    defaultValue: false,
  },
  {
    id: 'minimizeToTray',
    description: 'Minimize app to system tray.',
    defaultValue: false,
  },
  {
    id: 'outputDevice',
    description: 'Input device that will be used to solve breach protocol.',
    defaultValue: 'keyboard',
  },
  {
    id: 'engine',
    description: 'Program that will send input commands to Cyberpunk 2077.',
    defaultValue: BUILD_PLATFORM === 'win32' ? 'nircmd' : 'xdotool',
  },
  {
    id: 'ahkBinPath',
    description: 'Path to AutoHotkey executable.',
    defaultValue: '',
  },
  {
    id: 'downscaleSource',
    description:
      'Downscale source image to speed up OCR. This option have no effect on resolutions smaller than 4k.',
    defaultValue: false,
  },
  {
    id: 'resolveDelay',
    description:
      'Wait at least given amount of milliseconds counting from the start of a job before sending input commands. Using this option can help avoid bug with invalid sequence.',
    defaultValue: 0,
  },
  {
    id: 'keySelect',
    description: 'Key that is used to select code in the grid.',
    defaultValue: VK_ENTER,
  },
  {
    id: 'keyExit',
    description: 'Key that is used to exit breach protocol.',
    defaultValue: VK_ESCAPE,
  },
  {
    id: 'keyNavigateUp',
    description: 'Key that is used to navigate up in the grid.',
    defaultValue: VK_ARROW_UP,
  },
  {
    id: 'keyNavigateDown',
    description: 'Key that is used to navigate down in the grid.',
    defaultValue: VK_ARROW_DOWN,
  },
  {
    id: 'keyNavigateLeft',
    description: 'Key that is used to navigate left in the grid.',
    defaultValue: VK_ARROW_LEFT,
  },
  {
    id: 'keyNavigateRight',
    description: 'Key that is used to navigate right in the grid.',
    defaultValue: VK_ARROW_RIGHT,
  },
  {
    id: 'focusOnError',
    description: 'Focus BPA window on recognition error.',
    defaultValue: true,
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
