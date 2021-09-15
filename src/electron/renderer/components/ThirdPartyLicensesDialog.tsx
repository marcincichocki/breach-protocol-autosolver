import { PackageDetails } from '@/electron/common';
import { MouseEvent } from 'react';
import styled from 'styled-components';
import { useIpcEventDialog } from '../common';
import { FlatButton } from './Buttons';
import { Dialog, DialogBody, DialogTitle } from './Dialog';

const PackageInfo = styled.div`
  margin-bottom: 2rem;
`;

function openResourcesFolder(event: MouseEvent) {
  event.preventDefault();

  api.openResourcesFolder();
}

export const ThirdPartyLicensesDialog = () => {
  const {
    isOpen,
    close,
    data: contents,
  } = useIpcEventDialog<PackageDetails[]>('main:third-party-licenses');

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
