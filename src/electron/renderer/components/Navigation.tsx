import { MdKeyboardBackspace } from '@react-icons/all-files/md/MdKeyboardBackspace';
import {
  Link,
  NavLink as RouterNavLink,
  useRouteMatch,
} from 'react-router-dom';
import styled from 'styled-components';

const Nav = styled.nav`
  display: flex;
  justify-content: center;
  margin: 24px 1rem;
  user-select: none;
  flex-shrink: 0;
  position: relative;
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

const GoBackLink = styled(Link)`
  color: var(--accent);
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  /* svg is an inline element by default. */
  font-size: 0;
`;

export const Navigation = () => {
  const match = useRouteMatch<{ entryId: string }>('/calibrate/:entryId');
  const isAnalyzePage = useRouteMatch('/analyze');

  // Navigation is removed so user must discard or solve BP.
  if (isAnalyzePage) return null;

  return (
    <Nav>
      {match && (
        <GoBackLink to={`/history/${match.params.entryId}`}>
          <MdKeyboardBackspace size="2rem" />
        </GoBackLink>
      )}
      <List>
        <ListItem>
          <NavLink exact to="/">
            Dashboard
          </NavLink>
        </ListItem>
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
