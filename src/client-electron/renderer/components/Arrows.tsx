import { FC } from 'react';

export const ArrowLeft = () => (
  <svg width="26" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 13.5L26 0v3.5L23 4v11h-2V5L2 14.744V15H0v-1.5zM0 16.5L26 30v-3.5l-3-.5V15h-2v10L2 15.256V15H0v1.5z"
      fill="currentColor"
    />
  </svg>
);
export const ArrowRight = () => (
  <svg
    width="26"
    height="30"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    transform="scale(-1 1)"
  >
    <path
      d="M0 13.5L26 0v3.5L23 4v11h-2V5L2 14.744V15H0v-1.5zM0 16.5L26 30v-3.5l-3-.5V15h-2v10L2 15.256V15H0v1.5z"
      fill="currentColor"
    />
  </svg>
);

export const ArrowLeftFill = () => (
  <svg width="26" height="30" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M0 16.5L26 30v-3.5l-3-.5V15H0v1.5zM0 13.5L26 0v3.5L23 4v11H0v-1.5z"
      fill="currentColor"
    />
  </svg>
);
