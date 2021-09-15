import { PackageDetails } from '@/electron/common';
import { MouseEvent, useState } from 'react';
import styled from 'styled-components';
import { useIpcEvent } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';

function useThirdPartyLicenses() {
  const [isOpen, setIsOpen] = useState(false);
  const [contents, setContents] = useState<PackageDetails[]>(null);
  const close = () => setIsOpen(false);

  useIpcEvent(
    ['main:third-party-licenses'],
    (e, contents: PackageDetails[]) => {
      setContents(contents);
      setIsOpen(true);
    }
  );

  return { isOpen, contents, close };
}

const PackageInfo = styled.div`
  margin-bottom: 2rem;
`;

function openResourcesFolder(event: MouseEvent) {
  event.preventDefault();

  api.openResourcesFolder();
}

export const ThirdPartyLicensesDialog = () => {
  const { isOpen, close, contents } = useThirdPartyLicenses();

  if (!contents) {
    return null;
  }

  return (
    <Dialog isOpen={isOpen}>
      <DialogTitle>Third party licenses</DialogTitle>
      <DialogBody style={{ whiteSpace: 'pre-line' }}>
        <p>
          For more license information visit{' '}
          <a href="#" onClick={openResourcesFolder}>
            resources
          </a>{' '}
          directory.
        </p>
        {contents.map((details, i) => (
          <PackageInfo key={i}>
            <h2>
              {details.name}@{details.version}
            </h2>
            {details.repository && (
              <a href={details.repository}>{details.repository}</a>
            )}
            <p>{details.licenseText ?? details.license}</p>
          </PackageInfo>
        ))}
      </DialogBody>
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
