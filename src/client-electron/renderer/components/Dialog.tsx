import { useEffect } from 'react';
import { PropsWithChildren } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';

const DialogWrapper = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  z-index: 10;
  background: var(--background);
  border: 1px solid var(--accent);
`;

const Backdrop = styled.div`
  offset: 0;
  background: rgba(0, 0, 0, 0.5);
  inset: 0;
  position: fixed;
`;

const dialogRoot = document.getElementById('dialog-root');

interface DialogProps {
  show: boolean;
  onClose: () => void;
  render: ({ onClose }: { onClose: () => void }) => JSX.Element;
}

export const Dialog = ({
  children,
  show,
  render,
  onClose,
}: PropsWithChildren<DialogProps>) => {
  if (!show) {
    return null;
  }
  const el = document.createElement('div');

  useEffect(() => {
    if (show) {
      dialogRoot.appendChild(el);
    } else {
      dialogRoot.removeChild(el);
    }
  }, [show]);

  return createPortal(
    <>
      <Backdrop />
      <DialogWrapper>{render({ onClose })}</DialogWrapper>
    </>,
    el
  );
};
