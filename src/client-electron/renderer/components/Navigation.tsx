import styled from 'styled-components';
import { NavLink as RouterNavLink } from 'react-router-dom';
import { useContext } from 'react';
import { StateContext } from '../state';

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  margin: 24px 0;
`;

const List = styled.ul`
  display: flex;
  list-style: none;
  gap: 2rem;
  padding: 0;
  margin: 0;
`;

const ListItem = styled.li``;

export const NavLink = styled(RouterNavLink)`
  font-size: 2rem;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 500;
  color: var(--primary);

  &.active {
    color: var(--accent);
  }
`;

export const Navigation = () => {
  const state = useContext(StateContext);
  const { uuid } = state.history[0];

  return (
    <Nav>
      <List>
        <ListItem>
          <NavLink to="/history">History</NavLink>
        </ListItem>
        <ListItem>
          <NavLink to="/settings">Settings</NavLink>
        </ListItem>
      </List>
    </Nav>
  );
};
