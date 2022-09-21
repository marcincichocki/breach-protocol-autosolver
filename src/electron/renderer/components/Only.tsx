import { PropsWithChildren } from 'react';

interface OnlyProps {
  when: boolean;
}

export const Only = ({ when, children }: PropsWithChildren<OnlyProps>) =>
  when && <>{children}</>;
