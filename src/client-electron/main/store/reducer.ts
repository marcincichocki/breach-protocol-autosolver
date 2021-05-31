import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import {
  Action,
  AppSettings,
  HistoryEntry,
  State,
  WorkerStatus,
} from '../../common';
import { ActionTypes } from '../../actions';

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

const addHistoryEntry: Handler<HistoryEntry> = (state, { payload }) => {
  // TODO: add stats
  const stats = {};
  const { historySize } = state.settings;
  const history = [payload, ...state.history].slice(0, historySize);

  return { ...state, history };
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
