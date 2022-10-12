import type {
  ResolverSettings,
  RobotSettings,
  SharpImageContainerConfig,
} from '@/common/node';
import type {
  BreachProtocolFragmentResults,
  BreachProtocolLanguage,
  BreachProtocolOCROptions,
  BreachProtocolOptions,
  BreachProtocolResultJSON,
  FragmentId,
} from '@/core';
import type { ScreenshotDisplayOutput } from 'screenshot-desktop';
import type { SoundPlayerConfig } from '../worker/sound-player';

export enum WorkerStatus {
  Disconnected,
  Disabled,
  Bootstrap,
  Ready,
  Working,
}

export enum BreachProtocolStatus {
  Pending,
  Resolved,
  Rejected,
}

export enum BreachProtocolSolveProgress {
  Pending = 1 << 0,
  FragmentsValid = 1 << 1,
  SolutionFound = 1 << 2,
}

export interface HistoryEntry {
  version: string;
  commitSha: string;
  uuid: string;
  startedAt: number;
  finishedAt: number;
  status: BreachProtocolStatus;
  fileName: string;
  settings: AppSettings;
  fragments: BreachProtocolFragmentResults;
  result: BreachProtocolResultJSON;
}

// NOTE: KEY_BINDS and COMMAND indexes match exactly.
export const KEY_BINDS = [
  'keyBind',
  'keyBindWithPriority1',
  'keyBindWithPriority2',
  'keyBindWithPriority3',
  'keyBindWithPriority4',
  'keyBindWithPriority5',
  'keyBindAnalyze',
] as const;

export type BreachProtocolKeyBinds = typeof KEY_BINDS[number];
export type KeyBindsConfig = Record<BreachProtocolKeyBinds, string>;

export const COMMANDS = [
  'worker:solve',
  'worker:solve.withPriority1',
  'worker:solve.withPriority2',
  'worker:solve.withPriority3',
  'worker:solve.withPriority4',
  'worker:solve.withPriority5',
  'worker:analyze',
] as const;

export type BreachProtocolCommands = typeof COMMANDS[number];

export interface AppSettings
  extends RobotSettings,
    Required<SharpImageContainerConfig>,
    SoundPlayerConfig,
    KeyBindsConfig,
    ResolverSettings,
    Required<BreachProtocolOCROptions>,
    Pick<BreachProtocolOptions, 'strategy'> {
  historySize: number;
  preserveSourceOnSuccess: boolean;
  checkForUpdates: boolean;
  autoUpdate: boolean;
  minimizeToTray: boolean;
  outputDevice: 'mouse' | 'keyboard';
  engine: 'nircmd' | 'ahk' | 'xdotool';
  resolveDelay: number;
  focusOnError: boolean;
  gameLang: BreachProtocolLanguage;
}

export interface AppStats {
  /** Amount of successful breach protocols during session. */
  countSuccessSession: number;

  /** Total amount of successful breach protocols. */
  countSuccess: number;

  /** Amount of failed breach protocols during session. */
  countErrorSession: number;

  /** Total amount of failed breach protocols. */
  countError: number;

  /** Sum of approximated duration of every successful breach protocol. */
  approxDuration: number;

  /** Total amount of daemons. */
  daemonsCount: number;

  /** Total amount of solved daemons. */
  daemonsSolvedCount: number;
}

export enum UpdateStatus {
  Error,
  NetworkError,
  CheckingForUpdate,
  UpdateNotAvailable,
  UpdateAvailable,
  Downloading,
  UpdateDownloaded,
}

export type AnalysisOrigin = 'file' | 'screenshot' | 'clipboard';

export type AnalysisInput = string | Uint8Array | Buffer;

export interface AnalysisOptions {
  origin: AnalysisOrigin;
}

export interface AnalysisResult {
  items: BreachProtocolResultJSON[];
  hasNext: boolean;
}

export interface Analysis {
  entry: HistoryEntry;
  result: AnalysisResult;
  options: AnalysisOptions;
}

export interface State {
  history: HistoryEntry[];
  displays: ScreenshotDisplayOutput[];
  settings: AppSettings;
  status: WorkerStatus;
  updateStatus: UpdateStatus;
  stats: AppStats;
  analysis: Analysis;
}

export interface Action<T = any> {
  type: string;
  payload?: T;
  meta?: Record<string, any>;
}

export interface Request<T = any> {
  type: string;
  data?: T;
  uuid: string;
}

export interface Response<T = any> {
  data: T;
  uuid: string;
}

export interface TestThresholdData {
  fileName: string;
  threshold: number;
  fragmentId: FragmentId;
}

export abstract class NativeDialog {
  protected abstract showMessageBox(
    options: Electron.MessageBoxOptions
  ): Promise<Electron.MessageBoxReturnValue>;

  async confirm(options: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      title: PRODUCT_NAME,
      defaultId: 0,
      cancelId: 1,
      noLink: true,
      type: 'warning',
      buttons: ['Ok', 'Cancel'],
    };
    const { response } = await this.showMessageBox({
      ...defaultOptions,
      ...options,
    });

    return !response;
  }

  async alert(options?: Electron.MessageBoxOptions) {
    const defaultOptions: Partial<Electron.MessageBoxOptions> = {
      noLink: true,
      defaultId: 0,
      title: PRODUCT_NAME,
      type: 'warning',
      buttons: ['Ok'],
    };

    return this.showMessageBox({
      ...defaultOptions,
      ...options,
    });
  }
}

export interface PackageDetails {
  name: string;
  version: string;
  author: string;
  repository: string;
  source: string;
  license: string;
  licenseText: string;
}

interface ValidationErrors {
  [key: string]: boolean;
}

export interface KeyBindValidationErrors extends ValidationErrors {
  isValidAccelerator: boolean;
  isUnique: boolean;
  canRegister: boolean;
}

export interface DropZoneFileValidationErrors extends ValidationErrors {
  isSupportedFormat: boolean;
  isImage: boolean;
}

export function normalizeAccelerator(input: string) {
  return input.split('+').sort().join('+');
}
