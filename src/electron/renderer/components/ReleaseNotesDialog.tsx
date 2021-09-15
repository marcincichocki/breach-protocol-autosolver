import { sanitize } from 'dompurify';
import type { UpdateInfo } from 'electron-updater';
import React from 'react';
import { useIpcEventDialog } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';

export const ReleaseNotesDialog = () => {
  const {
    isOpen,
    close,
    data: updateInfo,
  } = useIpcEventDialog<UpdateInfo>('main:show-release-notes');

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
