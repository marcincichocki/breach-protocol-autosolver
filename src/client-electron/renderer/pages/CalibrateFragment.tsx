import { HistoryEntry, TestThresholdData } from '@/client-electron/common';
import { BreachProtocolFragmentResults, FragmentId } from '@/core';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { rendererAsyncRequestDispatcher as dispatch } from '../../common';
import { fromCamelCase } from '../common';
import {
  Col,
  FlatButton,
  FragmentPreview,
  RangeSlider,
  RawDataPreview,
  Row,
  Spinner,
  Switch,
} from '../components';
import { useFormControl } from '../form';

const Label = styled.label`
  font-size: 24px;
  color: var(--primary);
  flex-grow: 1;
  font-weight: 500;
`;

const FormField = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
`;

interface CalibrateFragmentProps {
  entry: HistoryEntry;
}

export const CalibrateFragment: FC<CalibrateFragmentProps> = ({ entry }) => {
  const { fragmentId } = useParams<{ fragmentId: FragmentId }>();
  const { fileName } = entry;
  const result = entry.fragments.find((f) => f.id === fragmentId);
  const [testResult, setTestResult] =
    useState<BreachProtocolFragmentResults[number]>(result);
  const showBoxes = useFormControl('showBoxes', false);
  const testThreshold = useFormControl('testThreshold', result.threshold);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (result.threshold != null) {
      testThreshold.setValue(result.threshold.toString());
    }

    setTestResult(result);
  }, [fragmentId]);

  async function onTestThreshold(value: any) {
    setLoading(true);

    const result = await dispatch<
      BreachProtocolFragmentResults[number],
      TestThresholdData
    >({
      type: 'TEST_THRESHOLD',
      data: { fileName, threshold: value, fragmentId },
    });

    setTestResult(result);
    setLoading(false);
  }

  return (
    <Row
      style={{
        gap: '1rem',
        flexGrow: 1,
        overflowY: 'auto',
      }}
    >
      <Col style={{ gap: '1rem', flexGrow: 1 }}>
        <RawDataPreview rawData={testResult.rawData} />

        <FormField>
          <Label>Show boxes</Label>
          <Switch {...showBoxes} />
        </FormField>
        <FormField>
          <Label>Threshold</Label>
          <RangeSlider
            {...testThreshold}
            min={0}
            max={255}
            onValueChange={onTestThreshold}
            disabled={
              loading ||
              (entry.options.experimentalBufferSizeRecognition &&
                fragmentId === 'bufferSize')
            }
          />
        </FormField>
        <FlatButton
          disabled={!testResult.isValid}
          color="accent"
          style={{ alignSelf: 'flex-end' }}
        >
          Update {fromCamelCase(fragmentId)} threshold
        </FlatButton>
      </Col>
      <Col
        style={{
          width: '600px',
          overflowY: 'auto',
          justifyContent: loading ? 'center' : 'flex-start',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        {loading ? (
          <Spinner />
        ) : (
          <FragmentPreview
            image={testResult.image}
            boxes={testResult.source?.boxes}
            showBoxes={showBoxes.checked}
          />
        )}
      </Col>
    </Row>
  );
};
