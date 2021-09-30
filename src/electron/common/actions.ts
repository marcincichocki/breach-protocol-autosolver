import type { ScreenshotDisplayOutput } from 'screenshot-desktop';
import {
  Action,
  AppSettings,
  HistoryEntry,
  UpdateStatus,
  WorkerStatus,
} from './common';

export const ActionTypes = {
  SET_DISPLAYS: 'SET_DISPLAYS',
  SET_STATUS: 'SET_STATUS',
  ADD_HISTORY_ENTRY: 'ADD_HISTORY_ENTRY',
  UPDATE_SETTINGS: 'UPDATE_SETTINGS',
  REMOVE_LAST_N_HISTORY_ENTRIES: 'REMOVE_LAST_N_HISTORY_ENTRIES',
  REMOVE_HISTORY_ENTRY: 'REMOVE_HISTORY_ENTRY',
  SET_UPDATE_STATUS: 'SET_UPDATE_STATUS',
} as const;

export class SetStatusAction implements Action {
  readonly type = ActionTypes.SET_STATUS;

  constructor(public readonly payload: WorkerStatus) {}
}

export class SetDisplaysAction implements Action {
  readonly type = ActionTypes.SET_DISPLAYS;

  constructor(public readonly payload: ScreenshotDisplayOutput[]) {}
}

export class UpdateSettingsAction implements Action {
  readonly type = ActionTypes.UPDATE_SETTINGS;

  constructor(
    public readonly payload: Partial<AppSettings>,
    public readonly meta?: Record<string, any>
  ) {}
}

export class AddHistoryEntryAction implements Action {
  readonly type = ActionTypes.ADD_HISTORY_ENTRY;

  constructor(public readonly payload: HistoryEntry) {}
}

export class RemoveLastNHistoryEntriesAction implements Action {
  readonly type = ActionTypes.REMOVE_LAST_N_HISTORY_ENTRIES;

  constructor(public readonly payload: number) {}
}

export class RemoveHistoryEntryAction implements Action {
  readonly type = ActionTypes.REMOVE_HISTORY_ENTRY;

  constructor(public readonly payload: string) {}
}

export class SetUpdateStatusAction implements Action {
  readonly type = ActionTypes.SET_UPDATE_STATUS;

  constructor(public readonly payload: UpdateStatus) {}
}
