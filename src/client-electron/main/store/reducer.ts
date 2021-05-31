import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import {
  Action,
  AppSettings,
  AppStats,
  BreachProtocolStatus,
  HistoryEntry,
  State,
  WorkerStatus,
} from '../../common';
import { ActionTypes } from '../../actions';
import { getDaemons } from '@/core/common';

type Handler<T, S = State> = (state: S, action: Action<T>) => State;

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
    timeApprox,
    countError,
    countSuccess,
    daemonsCount,
    daemonsSolvedCount,
  }: AppStats,
  { status, fragments, result }: HistoryEntry
) {
  if (status === BreachProtocolStatus.Resolved) {
    countSuccess += 1;

    const daemons = fragments.find(getDaemons);

    // Add 5 seconds for every daemon.
    timeApprox += daemons.rawData.length * 5;
    // Add 2 seconds for every square
    timeApprox += result.resolvedSequence.value.length * 2;

    daemonsCount += daemons.rawData.length;
    daemonsSolvedCount += result.sequence.parts.length;
  } else {
    countError += 1;
  }

  return {
    countSuccess,
    countError,
    timeApprox,
    daemonsCount,
    daemonsSolvedCount,
  };
}

const addHistoryEntry: Handler<HistoryEntry> = (state, { payload }) => {
  const stats = getStatsFromHistoryEntry(state.stats, payload);
  const { historySize } = state.settings;
  const history = [payload, ...state.history].slice(0, historySize);

  return { ...state, history, stats };
};

const updateSettings: Handler<Partial<AppSettings>> = (state, { payload }) => {
  const settings = {
    ...state.settings,
    ...payload,
  };

  return { ...state, settings };
};

export const appReducer = createReducer<State>({
  [ActionTypes.SET_DISPLAYS]: setDisplays,
  [ActionTypes.SET_STATUS]: setStatus,
  [ActionTypes.ADD_HISTORY_ENTRY]: addHistoryEntry,
  [ActionTypes.UPDATE_SETTINGS]: updateSettings,
});
