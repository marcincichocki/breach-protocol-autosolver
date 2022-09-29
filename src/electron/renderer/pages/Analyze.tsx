import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { dispatchAsyncRequest } from '../common';
import { Col, Row } from '../components';

export const Analyze = () => {
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
