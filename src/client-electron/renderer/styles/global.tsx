import { createGlobalStyle } from 'styled-components';
import { fonts } from './fonts';

export const GlobalStyles = createGlobalStyle`
  ${fonts}

  :root {
    --primary: #ff5851;
    --background: #121018;
    --accent: #5FF6FF;
  }

  html,
  body {
    height: 100%;
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
`;
