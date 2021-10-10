import { DropZoneFileValidationErrors } from '@/electron/common';
import { DragEvent as ReactDragEvent, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  createErrorMessageDispenser,
  dispatchAsyncRequest,
  nativeDialog,
} from '../common';
import { Spinner } from './Spinner';

const DropZone = styled.div<{ active: boolean; isLoading: boolean }>`
  display: ${(p) => (p.active ? 'flex' : 'none')};
  position: absolute;
  inset: 0;
  z-index: 100;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background: rgba(22, 18, 32, 0.9);
  border: 1rem dashed;
  color: ${(p) => (p.isLoading ? 'var(--accent)' : 'var(--primary)')};
  padding: 0 15vw;

  > * {
    pointer-events: none;
  }

  > svg > path {
    fill: var(--accent);
  }
`;

const DropZoneTitle = styled.h1`
  text-align: center;
  text-transform: uppercase;
  margin: 0;
  font-size: 5rem;
  font-weight: 500;
`;

const getErrorDetail = createErrorMessageDispenser({
  isImage: 'File must be an image.',
  isSupportedFormat: 'File must be in png or jpg format.',
});

function useDrag() {
  const [active, setActive] = useState(false);
  const hideDropZone = () => setActive(false);
  const showDropZone = (event: DragEvent) => {
    // Display dropzone only when dragging files.
    if (event.dataTransfer.types.includes('Files')) {
      setActive(true);
    }
  };
  const allowDrag = (event: ReactDragEvent) => {
    event.dataTransfer.dropEffect = 'copy';
    event.preventDefault();
  };

  useEffect(() => {
    window.addEventListener('dragenter', showDropZone);

    return () => {
      window.removeEventListener('dragenter', showDropZone);
    };
  }, []);

  return { active, hideDropZone, allowDrag };
}

export const AnalyzeDropZone = () => {
  const { active, hideDropZone, allowDrag } = useDrag();
  const [loading, setLoading] = useState(false);

  async function handleDrop(event: ReactDragEvent) {
    event.preventDefault();
    setLoading(true);

    const file = event.dataTransfer.files[0];
    const errors = await api.invoke<DropZoneFileValidationErrors>(
      'main:validate-file',
      file.type
    );

    if (!errors) {
      await dispatchAsyncRequest({ type: 'ANALYZE_FILE', data: file.path });
    } else {
      const message = 'Invalid input format.';
      const detail = getErrorDetail(errors);

      await nativeDialog.alert({
        message,
        detail,
      });
    }

    setLoading(false);
    hideDropZone();
  }

  return (
    <DropZone
      active={active}
      isLoading={loading}
      onDragLeave={hideDropZone}
      onDragEnter={allowDrag}
      onDragOver={allowDrag}
      onDrop={handleDrop}
    >
      <DropZoneTitle>
        {loading ? 'Analyzing' : 'Drop breach protocol image to analyze.'}
      </DropZoneTitle>
      {loading && <Spinner />}
    </DropZone>
  );
};
