import { useContext } from 'react';
import { useParams } from 'react-router-dom';
import { StateContext } from './state';

/** Return history entry based on entryId url param. */
export function useHistoryEntryFromParam() {
  const { entryId } = useParams<{ entryId: string }>();

  return useHistoryEntry(entryId);
}

export function useHistoryEntry(entryId: string) {
  const { history } = useContext(StateContext);

  return history.find((e) => e.uuid === entryId);
}
