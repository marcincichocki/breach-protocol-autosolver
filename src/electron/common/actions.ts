import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import {
  Action,
  AppSettings,
  HistoryEntry,
  Origin,
  WorkerStatus,
} from './common';

export const ActionTypes = {
  SET_DISPLAYS: 'SET_DISPLAYS',
  SET_STATUS: 'SET_STATUS',
  ADD_HISTORY_ENTRY: 'ADD_HISTORY_ENTRY',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  REMOVE_LAST_N_HISTORY_ENTRIES: 'REMOVE_LAST_N_HISTORY_ENTRIES',
  REMOVE_HISTORY_ENTRY: 'REMOVE_HISTORY_ENTRY',
} as const;

export class SetStatusAction implements Action {
  readonly type = ActionTypes.SET_STATUS;
  readonly origin = 'worker';

  constructor(public payload: WorkerStatus) {}
}

export class SetDisplaysAction implements Action {
  readonly type = ActionTypes.SET_DISPLAYS;
  readonly origin = 'worker';

  constructor(public payload: ScreenshotDisplayOutput[]) {}
}

export class UpdateSettingsAction implements Action {
  readonly type = ActionTypes.UPDATE_SETTINGS;

  constructor(
    public payload: Partial<AppSettings>,
    public origin: Origin = 'renderer',
    public meta?: Record<string, any>
  ) {}
}

export class AddHistoryEntryAction implements Action {
  readonly type = ActionTypes.ADD_HISTORY_ENTRY;
  readonly origin = 'worker';

  constructor(public payload: HistoryEntry) {}
}

export class RemoveLastNHistoryEntriesAction implements Action {
  readonly type = ActionTypes.REMOVE_LAST_N_HISTORY_ENTRIES;

  constructor(
    public readonly payload: number,
    public origin: Origin = 'renderer'
  ) {}
}

export class RemoveHistoryEntryAction implements Action {
  readonly type = ActionTypes.REMOVE_HISTORY_ENTRY;
  readonly origin = 'renderer';

  constructor(public readonly payload: string) {}
}
