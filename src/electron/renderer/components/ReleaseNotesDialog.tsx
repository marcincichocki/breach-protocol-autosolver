import { sanitize } from 'dompurify';
import type { UpdateInfo } from 'electron-updater';
import { useIpcEventDialog } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';
import { Only } from './Only';

export const ReleaseNotesDialog = () => {
  const {
    isOpen,
    close,
    data: updateInfo,
  } = useIpcEventDialog<UpdateInfo>('renderer:show-release-notes');

  if (!updateInfo) {
    return null;
  }

  const updateAvailable = VERSION !== updateInfo.version;

  function update() {
    api.send('main:update');

    close();
  }

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>
        {updateAvailable ? 'Update available' : 'Release notes'}
      </DialogTitle>
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
      <Only when={updateAvailable}>
        <FlatButton
          color="accent"
          style={{ alignSelf: 'flex-end' }}
          onClick={update}
        >
          Update to {updateInfo.version}
        </FlatButton>
      </Only>
    </Dialog>
  );
};
