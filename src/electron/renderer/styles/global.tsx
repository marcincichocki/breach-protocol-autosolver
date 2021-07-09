import { createGlobalStyle } from 'styled-components';
import './fonts.css';

export const GlobalStyles = createGlobalStyle`
  :root {
    --primary: #ff5851;
    --primary-dark: #701d1f;
    --primary-darker: #6f2223;
    --background: #161220;
    --background-disabled: #0c0c14;
    --accent: #5ff6ff;
    --success: #1bd676;
    --disabled: #bb9a95;
  }

  html,
  body {
    font-family: Rajdhani;
    color: #fff;
    letter-spacing: -0.5px;
  }

  body {
    margin: 0;
    background: linear-gradient(180deg, #3a1216 0%, var(--background) 82%);
  }

  #root {
    display: flex;
    flex-direction: column;
    height: 100vh;
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
