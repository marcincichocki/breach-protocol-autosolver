import { capitalize } from '@/common';
import {
  BreachProtocolFragmentResults,
  FragmentId,
  FragmentStatus,
  HEX_CODES,
} from '@/core';
import {
  HistoryEntry,
  TestThresholdData,
  UpdateSettingsAction,
} from '@/electron/common';
import { Fragment, useEffect, useState } from 'react';
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
  Row,
  Spinner,
  Switch,
  useField,
  JSONTree,
  JSONValidator,
} from '../components';

const Title = styled.h3`
  color: var(--primary);
  margin: 0;
  font-weight: 500;
  font-size: 1.2rem;
  text-transform: uppercase;
  letter-spacing: 0;
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

const statusMessages = {
  [FragmentStatus.InvalidSize]: 'Invalid size',
  [FragmentStatus.InvalidSymbols]: 'Invalid codes',
  [FragmentStatus.Valid]: 'Valid',
};

const RawDataStatusMessage = styled.span<{ status: FragmentStatus }>`
  position: absolute;
  bottom: 0.5rem;
  right: 1rem;
  color: ${(p) =>
    p.status === FragmentStatus.Valid ? 'var(--accent)' : 'var(--primary)'};
  font-size: 1.5rem;
  font-weight: 500;
  text-transform: uppercase;
`;

const BaseFragmentJSONTree = styled(JSONTree)`
  --gap: 0.5rem;

  .invalid {
    color: var(--primary);
  }
`;

const GridJSONTree = styled(BaseFragmentJSONTree)<{ columns: number }>`
  .root {
    display: grid;
    grid-gap: var(--gap);
    grid-template-columns: repeat(${(p) => p.columns}, max-content);
  }
`;

const DaemonsJSONTree = styled(BaseFragmentJSONTree)`
  .root > li > ul {
    display: flex;
    gap: var(--gap);
  }
`;

const FragmentJSONTrees = {
  [FragmentId.Grid]: GridJSONTree,
  [FragmentId.Daemons]: DaemonsJSONTree,
  [FragmentId.BufferSize]: JSONTree,
  [FragmentId.Types]: JSONTree,
};

const hexCodesSet = new Set<string>(HEX_CODES);
const hexCodeValidator: JSONValidator = (value) => {
  if (typeof value === 'string') {
    return hexCodesSet.has(value);
  }

  return true;
};

export const CalibrateFragment = ({ entry }: CalibrateFragmentProps) => {
  const { fragmentId } = useParams<{ fragmentId: FragmentId }>();
  const FragmentJSONTree = FragmentJSONTrees[fragmentId];
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
  const columns = Array.isArray(testResult.rawData)
    ? Math.round(Math.sqrt(testResult.rawData.length))
    : undefined;
  const validate =
    fragmentId === FragmentId.Grid || fragmentId === FragmentId.Daemons
      ? hexCodeValidator
      : undefined;

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
    const key = `threshold${capitalize(fragmentId)}` as const;
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
          <FragmentJSONTree
            data={testResult.rawData}
            expanded={true}
            columns={columns}
            validate={validate}
          >
            <RawDataStatusMessage status={testResult.status}>
              {statusMessages[testResult.status]}
            </RawDataStatusMessage>
          </FragmentJSONTree>
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
        <Col
          grow
          scroll
          style={{
            justifyContent: loading ? 'center' : 'flex-start',
            alignItems: 'center',
          }}
        >
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
        </Col>
      </Col>
    </Row>
  );
};
