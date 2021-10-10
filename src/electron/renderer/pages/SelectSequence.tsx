import { BreachProtocolResultJSON, isDaemonsFragment } from '@/core';
import { Analysis, WorkerStatus } from '@/electron/common';
import { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { dispatchAsyncRequest } from '../common';
import { Col, FlatButton, HistoryViewer, Row, Spacer } from '../components';
import { StateContext } from '../state';

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

interface SelectSequenceProps extends Analysis {}

export const SelectSequence = ({
  entry,
  results,
  options,
}: SelectSequenceProps) => {
  const { status } = useContext(StateContext);
  const [activeResult, setActiveResult] =
    useState<BreachProtocolResultJSON>(null);
  const history = useHistory();
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
  const isWorking = status === WorkerStatus.Working;
  const fromScreenShot = options.origin === 'screenshot';

  useEffect(() => {
    setActiveResult(null);
  }, [entry.uuid]);

  function isActiveSequence(result: BreachProtocolResultJSON) {
    const a = toUniqueValue(activeResult);
    const b = toUniqueValue(result);

    return a === b;
  }

  async function discard() {
    history.replace('/');

    await dispatchAsyncRequest({ type: 'ANALYZE_DISCARD' });
  }

  async function resolve() {
    await dispatchAsyncRequest({
      type: 'ANALYZE_RESOLVE',
      data: activeResult,
    });
  }

  return (
    <>
      <Col gap grow>
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
      </Col>
      <Col>
        <HistoryViewer entry={entry} customResult={activeResult} />
        <Row style={{ marginTop: 'auto' }}>
          <FlatButton color="primary" onClick={discard} disabled={isWorking}>
            Discard
          </FlatButton>
          <Spacer />
          {fromScreenShot && (
            <FlatButton
              color="accent"
              onClick={resolve}
              disabled={!activeResult || isWorking}
            >
              Solve with selected sequence
            </FlatButton>
          )}
        </Row>
      </Col>
    </>
  );
};
