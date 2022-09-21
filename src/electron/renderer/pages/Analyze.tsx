import { useContext, useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { dispatchAsyncRequest } from '../common';
import { Col, Row } from '../components';
import { StateContext } from '../state';
import { AnalyzeDetails } from './AnalyzeDetails';
import { SelectSequence } from './SelectSequence';

export const Analyze = () => {
  const { analysis } = useContext(StateContext);

  useEffect(() => {
    return () => {
      dispatchAsyncRequest({ type: 'ANALYZE_DISCARD' });
    };
  }, []);

  return (
    <Col grow>
      <Row gap grow scroll>
        <Switch>
          <Route path="/analyze/select">
            <SelectSequence {...analysis} />
          </Route>
          <Route path="/analyze/details">
            <AnalyzeDetails entry={analysis.entry} />
          </Route>
          <Redirect to="/analyze/select" />
        </Switch>
      </Row>
    </Col>
  );
};
