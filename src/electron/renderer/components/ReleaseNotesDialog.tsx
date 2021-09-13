import { sanitize } from 'dompurify';
import type { UpdateInfo } from 'electron-updater';
import React, { useState } from 'react';
import styled from 'styled-components';
import { useIpcEvent } from '../common';
import { FlatButton } from './Buttons';
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

const ReleaseNotes = styled.article`
  overflow-y: auto;
  margin: 1rem 0;
  padding-right: 1rem;

  a {
    color: var(--accent);
  }

  > ul {
    font-size: 1.1rem;
  }
`;

const ReleaseNotesTitle = styled.h1`
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
`;

export const ReleaseNotesDialog = () => {
  const { isOpen, close, updateInfo } = useReleaseNotes();

  function catchLink(event: React.MouseEvent | React.KeyboardEvent) {
    if (event.target instanceof HTMLAnchorElement) {
      event.preventDefault();

      api.openLinkInBrowser(event.target.href);
    }
  }

  if (!updateInfo) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen}>
      <ReleaseNotesTitle>Release notes</ReleaseNotesTitle>
      <span>{updateInfo.version}</span>
      <ReleaseNotes
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
