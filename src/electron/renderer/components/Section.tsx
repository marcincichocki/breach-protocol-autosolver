import { PropsWithChildren } from 'react';
import styled from 'styled-components';

const Header = styled.h1`
  background: rgba(22, 18, 32, 0.5);
  color: #fff;
  border-top: 2px solid var(--accent);
  font-size: 26px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  margin: 0;
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;

  &:not(:last-child) {
    margin-bottom: 2rem;
  }
`;

export const Section = ({
  title,
  children,
}: PropsWithChildren<{ title: string }>) => {
  return (
    <StyledSection>
      <Header>{title}</Header>
      {children}
    </StyledSection>
  );
};
