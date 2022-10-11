import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { dispatchAsyncRequest } from '../common';
import { Col, Row } from '../components';
import { NavigationItem, useNavigation } from '../router-ext';

const items: NavigationItem[] = [
  {
    label: 'Select sequence',
    to: '/analyze/select',
  },
  {
    label: 'Details',
    to: '/analyze/details',
  },
];

export const Analyze = () => {
  useNavigation({ items, from: '../' });
  useEffect(() => {
    return () => {
      dispatchAsyncRequest({ type: 'ANALYZE_DISCARD' });
    };
  }, []);

  return (
    <Col grow>
      <Row gap grow scroll>
        <Outlet />
      </Row>
    </Col>
  );
};
