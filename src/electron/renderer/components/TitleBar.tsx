import { memo } from 'react';
import styled from 'styled-components';

const StyledSvg = styled.svg.attrs({ width: 20, height: 20 })``;

const MinimizeIcon = () => (
  <StyledSvg>
    <path fill="currentColor" d="M5 10h10v1H5z" />
  </StyledSvg>
);

const DownIcon = () => (
  <StyledSvg>
    <path stroke="currentColor" fill="none" d="M5.5 5.5h9v9h-9z" />
  </StyledSvg>
);

const UpIcon = () => (
  <StyledSvg>
    <path stroke="currentColor" fill="none" d="M5.5 7.5h7v7h-7z" />
    <path stroke="currentColor" fill="none" d="M7.5 5.5h7v7h-7z" />
  </StyledSvg>
);

const CloseIcon = () => (
  <StyledSvg>
    <path fill="currentColor" d="M5.707 5l9.192 9.192-.707.707L5 5.707z" />
    <path fill="currentColor" d="M14.9 5.707l-9.193 9.192L5 14.192 14.193 5z" />
  </StyledSvg>
);

const MenuIcon = () => (
  <StyledSvg>
    <path fill="currentColor" d="M5.707 7l4.95 4.95-.707.707L5 7.707z" />
    <path fill="currentColor" d="M14.9 7.707l-4.95 4.95-.707-.708L14.193 7z" />
  </StyledSvg>
);

const StyledTitleBar = styled.nav`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 32px;
  display: flex;
  justify-content: flex-end;
  user-select: none;
  -webkit-app-region: drag;
`;

const IconButton = styled.button<{ close?: boolean }>`
  height: 32px;
  width: 46px;
  background: transparent;
  outline: none;
  border: none;
  color: #fff;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
  -webkit-app-region: no-drag;

  &:hover {
    background: ${(p) => (p.close ? '#e81123' : '#461f23')};
  }

  &:active {
    background: ${(p) => (p.close ? '#ff4857' : '#503033')};
  }
`;

export const TitleBar = memo(() => (
  <StyledTitleBar>
    <IconButton onClick={() => api.send('renderer:show-help-menu')}>
      <MenuIcon></MenuIcon>
    </IconButton>
    <IconButton onClick={() => api.send('renderer:minimize')}>
      <MinimizeIcon />
    </IconButton>
    <IconButton onClick={() => api.send('renderer:maximize')}>
      <DownIcon />
    </IconButton>
    <IconButton close onClick={() => api.send('renderer:close')}>
      <CloseIcon />
    </IconButton>
  </StyledTitleBar>
));
