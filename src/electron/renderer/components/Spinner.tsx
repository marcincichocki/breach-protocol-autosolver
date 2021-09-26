import styled, { keyframes } from 'styled-components';

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
`;

const SpinningSvg = styled.svg`
  animation: ${rotate} 2s linear infinite;
`;

export const Spinner = () => (
  <SpinningSvg width="54" height="54" fill="none">
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M27 53c14.36 0 26-11.64 26-26S41.36 1 27 1 1 12.64 1 27s11.64 26 26 26zm0 1c14.912 0 27-12.088 27-27S41.912 0 27 0 0 12.088 0 27s12.088 27 27 27zm19.901-25H44v2h-6.75c-1.6 4.097-5.586 7-10.25 7s-8.65-2.903-10.25-7H10v-2H7.099c1.003 10.107 9.53 18 19.9 18 10.372 0 18.899-7.893 19.902-18zm0-4H44v-2h-6.75c-1.6-4.097-5.586-7-10.25-7s-8.65 2.903-10.25 7H10v2H7.099c1.003-10.107 9.53-18 19.9-18 10.372 0 18.899 7.893 19.902 18zM27 36c4.633 0 8.448-3.5 8.945-8H32v-2h3.945a9.001 9.001 0 00-17.89 0H22v2h-3.945c.497 4.5 4.312 8 8.945 8zm10-9c0 5.523-4.477 10-10 10s-10-4.477-10-10 4.477-10 10-10 10 4.477 10 10z"
      fill="var(--primary)"
    />
  </SpinningSvg>
);
