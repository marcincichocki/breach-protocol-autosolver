import { BreachProtocolResultJSON, isDaemonsFragment } from '@/core';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { asyncRequestDispatcher } from '../common';
import {
  Col,
  FlatButton,
  HistoryViewer,
  Row,
  Spacer,
  Spinner,
} from '../components';
import { StateContext } from '../state';

const Title = styled.h1`
  font-size: 2rem;
  color: var(--accent);
  text-transform: uppercase;
  margin: 1.5rem 0;
  font-weight: 500;
`;

const SequenceList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  gap: 0.5rem;
  flex-direction: column;
  align-self: stretch;
  overflow-y: auto;
`;

const Sequence = styled.li<{ active?: boolean }>`
  background: ${(p) => (p.active ? 'var(--accent-dark)' : 'var(--background)')};
  color: var(--accent);
  border: 1px solid;
  border-color: ${(p) => (p.active ? 'var(--accent)' : 'var(--primary)')};
  padding: 1rem;
  font-weight: 500;
  font-size: 1.3rem;
  cursor: pointer;
  display: flex;
  gap: 0.3rem;

  ${(p) =>
    !p.active &&
    css`
      &:hover {
        background: var(--primary-darker);
        border-color: var(--accent);
      }
    `}
`;

function toUniqueValue(result: BreachProtocolResultJSON) {
  return result?.sequence.value.join('');
}

function useFetchResults() {
  const [results, setResults] = useState<BreachProtocolResultJSON[]>([]);

  useEffect(() => {
    asyncRequestDispatcher<BreachProtocolResultJSON[]>({
      type: 'ANALYZE_INIT',
    }).then(setResults);
  }, []);

  return results;
}

export const Analyze = () => {
  const {
    analysis: { entry },
  } = useContext(StateContext);
  const results = useFetchResults();
  const [activeResult, setActiveResult] =
    useState<BreachProtocolResultJSON>(null);
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
  const history = useHistory();

  function isActiveSequence(result: BreachProtocolResultJSON) {
    const a = toUniqueValue(activeResult);
    const b = toUniqueValue(result);

    return a === b;
  }

  async function discard() {
    await asyncRequestDispatcher({ type: 'ANALYZE_DISCARD' });

    history.replace('/');
  }

  async function resolve() {
    await asyncRequestDispatcher({
      type: 'ANALYZE_RESOLVE',
      data: activeResult,
    });
  }

  return (
    <Col grow>
      <Row justifyContent="center">
        <Title>Select sequence</Title>
      </Row>
      <Row gap grow scroll>
        <Col
          gap
          grow
          alignItems={!results.length ? 'center' : 'flex-start'}
          justifyContent={!results.length ? 'center' : 'flex-start'}
        >
          {!results.length ? (
            <Spinner />
          ) : (
            <SequenceList>
              {results.map((r, i) => (
                <Sequence
                  key={i}
                  active={isActiveSequence(r)}
                  onClick={() => setActiveResult(r)}
                >
                  {r.sequence.value.map((s, i) => (
                    <span key={i}>{s}</span>
                  ))}
                  <Spacer />
                  {r.sequence.parts.length}/{daemons.length}
                </Sequence>
              ))}
            </SequenceList>
          )}
        </Col>
        <Col>
          <HistoryViewer entry={entry} customResult={activeResult} />
          <Row style={{ marginTop: 'auto' }}>
            <FlatButton color="primary" onClick={discard}>
              Discard
            </FlatButton>
            <Spacer />
            <FlatButton
              color="accent"
              onClick={resolve}
              disabled={!activeResult}
            >
              Solve with selected sequence
            </FlatButton>
          </Row>
        </Col>
      </Row>
    </Col>
  );
};
