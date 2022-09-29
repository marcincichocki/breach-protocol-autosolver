import { MdKeyboardBackspace } from '@react-icons/all-files/md/MdKeyboardBackspace';
import { useContext } from 'react';
import { Link, NavLink as RouterNavLink, useMatch } from 'react-router-dom';
import styled from 'styled-components';
import { getFirstHistoryEntryPath } from '../common';
import { StateContext } from '../state';

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
  const match = useMatch('/calibrate/:entryId/*');
  const isAnalyzePage = useMatch('/analyze/*');
  const { history } = useContext(StateContext);
  const historyPath = getFirstHistoryEntryPath(history);

  return (
    <Nav>
      {match && (
        <GoBackLink to={`/history/${match.params.entryId}`}>
          <MdKeyboardBackspace size="2rem" />
        </GoBackLink>
      )}
      {isAnalyzePage ? (
        <List>
          <ListItem>
            <NavLink to="/analyze/select">Select sequence</NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/analyze/details">Details</NavLink>
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem>
            <NavLink to="/" end>
              Dashboard
            </NavLink>
          </ListItem>
          <ListItem>
            <NavLink to={historyPath}>History</NavLink>
          </ListItem>
          <ListItem>
            <NavLink to="/settings">Settings</NavLink>
          </ListItem>
        </List>
      )}
    </Nav>
  );
};
