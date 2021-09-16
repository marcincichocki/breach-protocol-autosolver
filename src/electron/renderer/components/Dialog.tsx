import { Component } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { createRootElement } from '../common';
import { Col } from './Flex';

interface DialogProps {
  isOpen?: boolean;
}

export class Dialog extends Component<DialogProps> {
  private el = document.createElement('div');

  static root = createRootElement('dialog-root');

  override componentDidMount() {
    Dialog.root.appendChild(this.el);
  }

  override componentWillUnmount() {
    Dialog.root.removeChild(this.el);
  }

  override render() {
    if (!this.props.isOpen) {
      return null;
    }

    return createPortal(
      <DialogContent children={this.props.children} />,
      this.el
    );
  }
}

const DialogWrapper = styled(Col)`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: clamp(500px, 50%, 800px);
  max-height: min(75%, 1000px);
  background: var(--background);
  border: 1px solid var(--primary);
  padding: 1rem;
  z-index: 1;
`;

const OverlayBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1;
`;

export const DialogBody = styled.section`
  overflow-y: auto;
  margin: 1rem 0;
  padding-right: 1rem;
  font-size: 1.1rem;
  font-weight: 500;

  a {
    color: var(--accent);
  }
`;

export const DialogTitle = styled.h1`
  margin: 0;
  color: var(--accent);
  text-transform: uppercase;
`;

interface DialogContentProps {
  children?: React.ReactNode;
}

const DialogContent = ({ children }: DialogContentProps) => {
  return (
    <>
      <OverlayBackdrop />
      <DialogWrapper>{children}</DialogWrapper>
    </>
  );
};
