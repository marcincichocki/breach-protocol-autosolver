import { useContext } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { Col, Row } from '../components';
import { StateContext } from '../state';
import { AnalyzeDetails } from './AnalyzeDetails';
import { SelectSequence } from './SelectSequence';

export const Analyze = () => {
  const {
    analysis: { entry, results },
  } = useContext(StateContext);

  return (
    <Col grow>
      <Row gap grow scroll>
        <Switch>
          <Route path="/analyze/select">
            <SelectSequence entry={entry} results={results} />
          </Route>
          <Route path="/analyze/details">
            <AnalyzeDetails entry={entry} />
          </Route>
          <Redirect to="/analyze/select" />
        </Switch>
      </Row>
    </Col>
  );
};
