import {
  JSONValue,
  VK_ARROW_DOWN,
  VK_ARROW_LEFT,
  VK_ARROW_RIGHT,
  VK_ARROW_UP,
  VK_ENTER,
  VK_ESCAPE,
} from '@/common';
import {
  DAEMON_ADVANCED_DATAMINE,
  DAEMON_BASIC_DATAMINE,
  DAEMON_CAMERA_SHUTDOWN,
  DAEMON_DATAMINE_COPY_MALWARE,
  DAEMON_DATAMINE_CRAFTING_SPECS,
  DAEMON_DATAMINE_V1,
  DAEMON_DATAMINE_V2,
  DAEMON_DATAMINE_V3,
  DAEMON_EXPERT_DATAMINE,
  DAEMON_FRIENDLY_TURRETS,
  DAEMON_GAIN_ACCESS,
  DAEMON_ICEPICK,
  DAEMON_MASS_VULNERABILITY,
  DAEMON_NEUTRALIZE_MALWARE,
  DAEMON_OPTICS_JAMMER,
  DAEMON_TURRET_SHUTDOWN,
  DAEMON_WEAPONS_JAMMER,
} from '@/core';
import { AppSettings } from './common';

interface BreachProtocolOption {
  id: keyof AppSettings;
  description: string;
  defaultValue: JSONValue;
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
    id: 'keyBindWithPriority6',
    description: 'Solve breach protocol(prioritize sixth daemon).',
    defaultValue: 'Alt+6',
  },
  {
    id: 'keyBindWithPriority7',
    description: 'Solve breach protocol(prioritize seventh daemon).',
    defaultValue: 'Alt+7',
  },
  {
    id: 'keyBindAnalyze',
    description: 'Analyze breach protocol and display available sequences.',
    defaultValue: 'CommandOrControl+`',
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
    description: 'Sound played when error occurred during recognition.',
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
    defaultValue: 30,
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
    id: 'thresholdTypes',
    description: 'Fixed threshold value for types fragment.',
    defaultValue: 127,
  },
  {
    id: 'thresholdTypesAuto',
    description: 'Use automatic threshold for types fragment.',
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
  {
    id: 'filterRecognizerResults',
    description:
      'Remove results from optical character recognition that do not look like codes.',
    defaultValue: true,
  },
  {
    id: 'gameLang',
    description:
      'Language in which game is running. Changing this option will cause next recognition to be slower.',
    defaultValue: 'eng',
  },
  {
    id: 'skipTypesFragment',
    description: 'Prevent daemon types from being recognized.',
    defaultValue: false,
  },
  {
    id: 'extendedDaemonsAndTypesRecognitionRange',
    description:
      'Use extended OCR range for daemons and types fragments. Removes upper bound of max daemons.',
    defaultValue: false,
  },
  {
    id: 'extendedBufferSizeRecognitionRange',
    description:
      'Use extended OCR range for buffer size fragment. Removes upper bound of max buffer size.',
    defaultValue: false,
  },
  {
    id: 'useFixedBufferSize',
    description:
      'Use fixed buffer size. This option will disable buffer size fragment recognition.',
    defaultValue: false,
  },
  {
    id: 'fixedBufferSize',
    description:
      'Amount of buffer size there is currently available in equipped cyberdeck.',
    defaultValue: 4,
  },
  {
    id: 'strategy',
    description: 'Algorithm that will be used to find path.',
    defaultValue: 'bfs',
  },
  {
    id: 'sortDaemonsBySequence',
    description: 'Sort daemons in history viewer by order in the sequence.',
    defaultValue: false,
  },
  {
    id: 'hierarchy',
    description:
      'Hierarchy determines order of generated sequences. In index hierarchy each daemon is more important than daemons above it. In types hierarchy type of a daemon determines its value(requires types to be recognized).',
    defaultValue: 'index',
  },
  {
    id: 'daemonPriority',
    description: 'Specifiy priority of each daemon.',
    defaultValue: [
      DAEMON_DATAMINE_COPY_MALWARE,
      DAEMON_NEUTRALIZE_MALWARE,
      DAEMON_GAIN_ACCESS,
      DAEMON_DATAMINE_CRAFTING_SPECS,
      DAEMON_OPTICS_JAMMER,
      DAEMON_WEAPONS_JAMMER,
      DAEMON_CAMERA_SHUTDOWN,
      DAEMON_MASS_VULNERABILITY,
      DAEMON_FRIENDLY_TURRETS,
      DAEMON_TURRET_SHUTDOWN,
      DAEMON_ICEPICK,
      DAEMON_DATAMINE_V3,
      DAEMON_DATAMINE_V2,
      DAEMON_DATAMINE_V1,
      DAEMON_EXPERT_DATAMINE,
      DAEMON_ADVANCED_DATAMINE,
      DAEMON_BASIC_DATAMINE,
    ],
  },
  {
    id: 'immediate',
    description:
      'Determines if sequences should be emitted immediately, or should they be grouped by permutation of daemons. Grouped sequences are sorted by raw path length.',
    defaultValue: false,
  },
  {
    id: 'patch',
    description: 'Installed patch of Cyberpunk 2077.',
    defaultValue: '2.x',
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
