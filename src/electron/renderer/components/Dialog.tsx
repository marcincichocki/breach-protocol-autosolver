import { Component } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { createRootElement } from '../common';

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

const DialogWrapper = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 300px;
  height: 300px;
  background: var(--background);
  border: 1px solid var(--primary);
  padding: 1rem;
`;

const OverlayBackdrop = styled.div`
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
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
