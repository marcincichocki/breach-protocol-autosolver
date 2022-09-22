import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

export const List = styled.ul`
  overflow-y: auto;
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1 0 250px; // required?
  align-self: stretch; // required?
`;

export const ListItem = styled.li``;

export const ListItemLink = styled(NavLink)`
  border: 1px solid var(--primary);
  background: var(--background);
  height: 70px;
  display: flex;
  align-items: center;
  color: var(--accent);
  flex-shrink: 0;
  text-decoration: none;
  gap: 1rem;
  text-transform: uppercase;
  font-size: 1.2rem;
  font-weight: 500;
  padding: 0 1rem;

  &:focus-visible {
    outline-offset: -2px;
  }

  &:hover:not(.active) {
    border-color: var(--accent);
    background: var(--primary-darker);
  }

  &.active {
    border-color: var(--accent);
    background: var(--accent-darker);
  }
`;

// const Sequence = styled.button<{ active?: boolean }>`
//   background: ${(p) => (p.active ? 'var(--accent-dark)' : 'var(--background)')};
//   color: var(--accent);
//   border: 1px solid;
//   border-color: ${(p) => (p.active ? 'var(--accent)' : 'var(--primary)')};
//   padding: 1rem;
//   font-weight: 500;
//   font-size: 1.3rem;
//   cursor: pointer;
//   display: flex;
//   gap: 0.3rem;

//   ${(p) =>
//     !p.active &&
//     css`
//       &:hover {
//         background: var(--primary-darker);
//         border-color: var(--accent);
//       }
//     `}
// `;
