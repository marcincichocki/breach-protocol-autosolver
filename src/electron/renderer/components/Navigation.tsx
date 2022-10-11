import { MdKeyboardBackspace } from '@react-icons/all-files/md/MdKeyboardBackspace';
import { useContext } from 'react';
import { Link, NavLink as RouterNavLink } from 'react-router-dom';
import styled from 'styled-components';
import { RouterExtContext } from '../router-ext';
import { Only } from './Only';

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

const NavigateBackLink = styled(Link)`
  color: var(--accent);
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  /* svg is an inline element by default. */
  font-size: 0;
`;

export const Navigation = () => {
  const { items, from } = useContext(RouterExtContext);

  return (
    <Nav>
      <Only when={!!from}>
        <NavigateBackLink to={from}>
          <MdKeyboardBackspace size="2rem" />
        </NavigateBackLink>
      </Only>
      <List>
        {items.map((item, index) => (
          <ListItem key={index}>
            <NavLink {...item}>{item.label}</NavLink>
          </ListItem>
        ))}
      </List>
    </Nav>
  );
};
