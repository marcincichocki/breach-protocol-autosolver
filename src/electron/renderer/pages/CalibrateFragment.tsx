import { BreachProtocolFragmentResults, FragmentId } from '@/core';
import {
  HistoryEntry,
  TestThresholdData,
  UpdateSettingsAction,
} from '@/electron/common';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import styled from 'styled-components';
import { dispatchAsyncRequest, fromCamelCase } from '../common';
import {
  Col,
  Field,
  FlatButton,
  Form,
  FragmentPreview,
  Label,
  RangeSlider,
  RawDataPreview,
  Row,
  Spinner,
  Switch,
  useField,
} from '../components';

const Title = styled.h3`
  color: var(--primary);
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
`;

const FragmentPreviewContainer = styled(Col).attrs({
  tabIndex: 0,
  grow: true,
  scroll: true,
})<{ isLoading: boolean }>`
  justify-content: ${(p) => (p.isLoading ? 'center' : 'flex-start')};
  align-items: center;

  &:focus-visible {
    outline-offset: -2px;
  }
`;

interface CalibrateFormValues {
  showBoxes: boolean;
  testThreshold: number;
}

interface CalibrateFragmentProps {
  entry: HistoryEntry;
}

const ThresholdUpdater = ({
  threshold,
}: {
  threshold: number;
}): JSX.Element => {
  const { setValue } = useField<number>();

  useEffect(() => {
    setValue(threshold, { emit: false });
  }, [threshold]);

  return null;
};

function capitalize(s: string) {
  return s[0].toUpperCase() + s.slice(1);
}

export const CalibrateFragment = ({ entry }: CalibrateFragmentProps) => {
  const { fragmentId } = useParams<{ fragmentId: FragmentId }>();
  const { fileName } = entry;
  const result = entry.fragments.find((f) => f.id === fragmentId);
  const [testResult, setTestResult] =
    useState<BreachProtocolFragmentResults[number]>(result);
  const isBufferSize = fragmentId === FragmentId.BufferSize;
  const isExperimental =
    entry.settings.experimentalBufferSizeRecognition && isBufferSize;
  const [loading, setLoading] = useState<boolean>(false);
  const [showBoxes, setShowBoxes] = useState(false);
  const [testThreshold, setTestThreshold] = useState<number>(
    result.threshold ?? 0
  );

  useEffect(() => {
    setTestResult(result);
    setTestThreshold(result.threshold ?? 0);
  }, [fragmentId]);

  async function onTestThreshold(threshold: number) {
    setLoading(true);

    const result = await dispatchAsyncRequest<
      BreachProtocolFragmentResults[number],
      TestThresholdData
    >({
      type: 'TEST_THRESHOLD',
      data: { fileName, threshold, fragmentId },
    });

    setTestResult(result);
    setLoading(false);
  }

  function handleSubmit(values: CalibrateFormValues) {
    const key = `threshold${capitalize(fragmentId)}`;
    const payload = {
      [key]: values.testThreshold,
      [`${key}Auto`]: false,
    };

    api.dispatch(new UpdateSettingsAction(payload));
  }

  return (
    <Row gap grow scroll>
      <Col gap grow>
        <Col grow scroll>
          <Title>Raw data</Title>
          <RawDataPreview
            rawData={testResult.rawData}
            status={testResult.status}
          />
        </Col>
        <Form<CalibrateFormValues>
          initialValues={{ showBoxes, testThreshold }}
          onSubmit={handleSubmit}
        >
          <Field name="showBoxes" onValueChange={setShowBoxes}>
            <Label>Show boxes</Label>
            <Switch disabled={isBufferSize} />
          </Field>
          <Field name="testThreshold" onValueChange={onTestThreshold}>
            <Label>Test threshold</Label>
            <RangeSlider
              min={0}
              max={255}
              disabled={loading || isExperimental}
            />
            <ThresholdUpdater threshold={testThreshold} />
          </Field>
          <FlatButton
            type="submit"
            disabled={!testResult.isValid || loading || isExperimental}
            color="accent"
            style={{ alignSelf: 'flex-end' }}
          >
            Update {fromCamelCase(fragmentId)} threshold
          </FlatButton>
        </Form>
      </Col>
      <Col style={{ width: '600px', flexShrink: 0 }}>
        <Title>Fragment preview</Title>
        <FragmentPreviewContainer isLoading={loading}>
          {loading ? (
            <Spinner />
          ) : (
            <FragmentPreview
              image={testResult.image}
              boxes={testResult.source?.boxes}
              showBoxes={showBoxes}
              format={entry.settings.format}
            />
          )}
        </FragmentPreviewContainer>
      </Col>
    </Row>
  );
};
