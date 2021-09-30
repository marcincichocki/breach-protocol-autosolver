import { sanitize } from 'dompurify';
import type { UpdateInfo } from 'electron-updater';
import { useIpcEventDialog } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';

export const ReleaseNotesDialog = () => {
  const {
    isOpen,
    close,
    data: updateInfo,
  } = useIpcEventDialog<UpdateInfo>('renderer:show-release-notes');

  if (!updateInfo) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>Release notes</DialogTitle>
      <span>{updateInfo.version}</span>
      <DialogBody
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
