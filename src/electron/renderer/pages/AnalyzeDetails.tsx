import { FragmentId } from '@/core';
import { HistoryEntry } from '@/electron/common';
import { MouseEvent, useState } from 'react';
import styled from 'styled-components';
import { fromCamelCase } from '../common';
import { Col, FragmentPreview, Row, Spacer } from '../components';

const Title = styled.h3`
  color: var(--primary);
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const HistoryEntryPreview = styled.pre`
  white-space: pre-wrap;
  word-break: break-word;
  overflow: auto;
  background: var(--background);
  border: 1px solid var(--primary);
  margin: 0;
  padding: 1rem;
`;

const FragmentLink = styled.a<{ active: boolean }>`
  font-size: 2rem;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 500;
  color: ${(p) => (p.active ? 'var(--accent)' : 'var(--primary)')};
  cursor: pointer;
`;

export const AnalyzeDetails = ({ entry }: { entry: HistoryEntry }) => {
  const [fragmentId, setFragmentId] = useState<FragmentId>(FragmentId.Grid);
  const fragment = entry.fragments.find((f) => f.id === fragmentId);

  function changeEntry(event: MouseEvent, id: FragmentId) {
    event.preventDefault();

    setFragmentId(id);
  }

  return (
    <Col>
      <Row style={{ gap: '2rem' }}>
        {entry.fragments.map((f) => (
          <FragmentLink
            key={f.id}
            onClick={(e) => changeEntry(e, f.id)}
            active={f.id === fragmentId}
          >
            {fromCamelCase(f.id)}
          </FragmentLink>
        ))}
        <Spacer />
      </Row>
      <Row gap scroll>
        <Col>
          <Title>Entry</Title>
          <HistoryEntryPreview>
            {JSON.stringify(entry, null, 2)}
          </HistoryEntryPreview>
        </Col>
        <Col style={{ width: '600px', flexShrink: 0 }}>
          <Title>Fragment preview</Title>
          <Col grow scroll>
            <FragmentPreview
              image={fragment.image}
              boxes={fragment.source?.boxes}
              showBoxes={true}
              format={entry.settings.format}
            />
          </Col>
        </Col>
      </Row>
    </Col>
  );
};
