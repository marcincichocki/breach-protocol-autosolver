import { sanitize } from 'dompurify';
import type { UpdateInfo } from 'electron-updater';
import React, { useState } from 'react';
import { useIpcEvent } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';

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

  function catchLink(event: React.MouseEvent | React.KeyboardEvent) {
    if (event.target instanceof HTMLAnchorElement) {
      event.preventDefault();

      api.openExternal(event.target.href);
    }
  }

  if (!updateInfo) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>Release notes</DialogTitle>
      <span>{updateInfo.version}</span>
      <DialogBody
        onClick={catchLink}
        onKeyDown={catchLink}
        dangerouslySetInnerHTML={{
          __html: sanitize(updateInfo.releaseNotes as string),
        }}
      />
      <FlatButton
        onClick={close}
        color="accent"
        style={{ alignSelf: 'flex-end' }}
      >
        Close
      </FlatButton>
    </Dialog>
  );
};
