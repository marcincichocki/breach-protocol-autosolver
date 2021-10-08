import { isDaemonsFragment } from '@/core';
import {
  Action,
  ActionTypes,
  AppSettings,
  AppStats,
  BreachProtocolStatus,
  HistoryEntry,
  State,
  UpdateStatus,
  WorkerStatus,
} from '@/electron/common';
import type { ScreenshotDisplayOutput } from 'screenshot-desktop';

type Handler<T = any, S = State> = (state: S, action: Action<T>) => State;

export function createReducer<S = State>(
  handlers: Record<string, Handler<any, S>>
) {
  return (state: S, action: Action) => {
    if (handlers.hasOwnProperty(action.type)) {
      return handlers[action.type](state, action);
    }

    return state;
  };
}

const setDisplays: Handler<ScreenshotDisplayOutput[]> = (
  state,
  { payload }
) => ({ ...state, displays: payload });

const setStatus: Handler<WorkerStatus> = (state, { payload }) => ({
  ...state,
  status: payload,
});

function getStatsFromHistoryEntry(
  {
    approxDuration,
    countErrorSession,
    countError,
    countSuccessSession,
    countSuccess,
    daemonsCount,
    daemonsSolvedCount,
  }: AppStats,
  { status, fragments, result, startedAt, finishedAt }: HistoryEntry
) {
  if (status === BreachProtocolStatus.Resolved) {
    countSuccessSession += 1;
    countSuccess += 1;

    const daemonsFragment = fragments.find(isDaemonsFragment);
    const daemonsSize = daemonsFragment.rawData.length;

    // Add 5 seconds for every daemon and 2 seconds for every square.
    const sequenceDuration = daemonsSize * 5;
    const gridDuration = result.resolvedSequence.value.length * 2;
    const timeElapsed = Math.round((finishedAt - startedAt) / 1000);
    const timeSaved = sequenceDuration + gridDuration - timeElapsed;

    if (timeSaved > 0) {
      approxDuration += timeSaved;
    }

    daemonsCount += daemonsSize;
    daemonsSolvedCount += result.sequence.parts.length;
  } else {
    countErrorSession += 1;
    countError += 1;
  }

  return {
    approxDuration,
    countErrorSession,
    countError,
    countSuccessSession,
    countSuccess,
    daemonsCount,
    daemonsSolvedCount,
  };
}

const addHistoryEntry: Handler<HistoryEntry> = (state, { payload }) => {
  const stats = getStatsFromHistoryEntry(state.stats, payload);
  const history = [payload, ...state.history];

  return { ...state, history, stats };
};

const updateSettings: Handler<Partial<AppSettings>> = (state, { payload }) => {
  const settings = {
    ...state.settings,
    ...payload,
  };

  return { ...state, settings };
};

const removeLastNHistoryEntries: Handler<number> = (state, { payload }) => ({
  ...state,
  history: state.history.slice(0, -1 * payload),
});

const removeHistoryEntry: Handler<string> = (state, { payload }) => ({
  ...state,
  history: state.history.filter((e) => e.uuid !== payload),
});

const setUpdateStatus: Handler<UpdateStatus> = (state, { payload }) => ({
  ...state,
  updateStatus: payload,
});

export const appReducer = createReducer<State>({
  [ActionTypes.SET_DISPLAYS]: setDisplays,
  [ActionTypes.SET_STATUS]: setStatus,
  [ActionTypes.ADD_HISTORY_ENTRY]: addHistoryEntry,
  [ActionTypes.UPDATE_SETTINGS]: updateSettings,
  [ActionTypes.REMOVE_LAST_N_HISTORY_ENTRIES]: removeLastNHistoryEntries,
  [ActionTypes.REMOVE_HISTORY_ENTRY]: removeHistoryEntry,
  [ActionTypes.SET_UPDATE_STATUS]: setUpdateStatus,
});
