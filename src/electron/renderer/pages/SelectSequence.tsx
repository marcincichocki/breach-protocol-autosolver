import { BreachProtocolResultJSON, isDaemonsFragment } from '@/core';
import { WorkerStatus } from '@/electron/common';
import { useContext, useEffect, useState } from 'react';
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

export const SelectSequence = () => {
  const {
    analysis: { entry, options, result },
    settings: { sortDaemonsBySequence },
  } = useContext(StateContext);
  const { status } = useContext(StateContext);
  const [activeResult, setActiveResult] =
    useState<BreachProtocolResultJSON>(null);
  const { rawData: daemons } = entry.fragments.find(isDaemonsFragment);
  const isWorking = status === WorkerStatus.Working;
  const fromScreenShot = options.origin === 'screenshot';

  useEffect(() => {
    setActiveResult(result.items[0]);
  }, [entry.uuid]);

  function isActiveSequence(result: BreachProtocolResultJSON) {
    const a = toUniqueValue(activeResult);
    const b = toUniqueValue(result);

    return a === b;
  }

  async function resolve() {
    await dispatchAsyncRequest({
      type: 'ANALYZE_RESOLVE',
      data: activeResult,
    });
  }

  function loadMore() {
    dispatchAsyncRequest({ type: 'ANALYZE_LOAD_MORE' });
  }

  return (
    <>
      <Col gap flex={1}>
        <SequenceList>
          {result.items.map((r, i) => (
            <Sequence
              key={i}
              active={isActiveSequence(r)}
              onClick={() => setActiveResult(r)}
            >
              {r.sequence.value.map((s, i) => (
                <span key={i}>{s}</span>
              ))}
              <Spacer />
              {r.resolvedSequence.parts.length}/{daemons.length}
            </Sequence>
          ))}
        </SequenceList>
        {result.hasNext && (
          <FlatButton disabled={isWorking} color="accent" onClick={loadMore}>
            Load more
          </FlatButton>
        )}
      </Col>
      <Col gap flex={1}>
        <HistoryViewer
          entry={entry}
          customResult={activeResult}
          sortDaemonsBySequence={sortDaemonsBySequence}
        />
        <Row style={{ marginTop: 'auto', justifyContent: 'flex-end' }}>
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
