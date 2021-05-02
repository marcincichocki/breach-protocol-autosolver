import { createGlobalStyle } from 'styled-components';
import { fonts } from './fonts';

export const GlobalStyles = createGlobalStyle`
  ${fonts}

  :root {
    --primary: #ff5851;
    --primary-dark: #701d1f;
    --primary-darker: #6f2223;
    /* --background: #121018; */
    --background: #161220;
    --accent: #5FF6FF;
  }

  html,
  body {
    height: 100%;
    max-height: 100%;
    font-family: Rajdhani;
  }

  body {
    margin: 0;
    background: linear-gradient(180deg, #3a1216 0%, var(--background) 82%);
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: var(--primary-darker)
  }
  
  ::-webkit-scrollbar-thumb {
    background: var(--primary);
  }
`;