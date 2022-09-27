import { FragmentId } from '@/core';
import { MouseEvent, useContext, useState } from 'react';
import styled from 'styled-components';
import { fromCamelCase } from '../common';
import {
  Col,
  FragmentPreview,
  JSONTree,
  JSONTreeActions,
  JSONTreeCopy,
  Row,
  Spacer,
} from '../components';
import { StateContext } from '../state';

const Title = styled.h3`
  color: var(--primary);
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const FragmentLink = styled.a<{ active: boolean }>`
  font-size: 2rem;
  text-decoration: none;
  text-transform: uppercase;
  font-weight: 500;
  color: ${(p) => (p.active ? 'var(--accent)' : 'var(--primary)')};
  cursor: pointer;
`;

export const AnalyzeDetails = () => {
  const {
    analysis: { entry },
  } = useContext(StateContext);
  const [fragmentId, setFragmentId] = useState<FragmentId>(FragmentId.Grid);
  const fragment = entry.fragments.find((f) => f.id === fragmentId);

  function changeEntry(event: MouseEvent, id: FragmentId) {
    event.preventDefault();

    setFragmentId(id);
  }

  return (
    <Col grow>
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
      <Row grow gap scroll>
        <Col grow>
          <Title>Entry</Title>
          <JSONTree data={entry as Record<string, any>} expanded={true}>
            <JSONTreeActions>
              <JSONTreeCopy />
            </JSONTreeActions>
          </JSONTree>
        </Col>
        <Col style={{ width: '600px', flexShrink: 0 }}>
          <Title>Fragment preview</Title>
          <Col grow scroll>
            <FragmentPreview
              image={fragment.image}
              boxes={fragment.source?.boxes}
              showBoxes={true}
            />
          </Col>
        </Col>
      </Row>
    </Col>
  );
};
