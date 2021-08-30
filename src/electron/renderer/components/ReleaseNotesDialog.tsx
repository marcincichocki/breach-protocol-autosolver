import type { UpdateInfo } from 'electron-updater';
import { useState } from 'react';
import { useIpcEvent } from '../common';
import { Dialog } from './Dialog';

function useReleaseNotes() {
  const [isOpen, setIsOpen] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<UpdateInfo>(null);
  const close = () => setIsOpen(false);

  useIpcEvent(['main:show-release-notes'], (e, info: UpdateInfo) => {
    setUpdateInfo(info);
    setIsOpen(true);
  });

  return { isOpen, updateInfo, close };
}

export const ReleaseNotesDialog = () => {
  const { isOpen, close, updateInfo } = useReleaseNotes();

  if (!updateInfo) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen}>
      <h1>{updateInfo.version}</h1>
      <div
        dangerouslySetInnerHTML={{ __html: updateInfo.releaseNotes as string }}
      ></div>
      <button onClick={close}>Close</button>
    </Dialog>
  );
};
