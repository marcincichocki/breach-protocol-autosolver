import { UpdateSettingsAction } from '@/client-electron/actions';
import { HistoryEntry, TestThresholdData } from '@/client-electron/common';
import { BreachProtocolFragmentResults, FragmentId } from '@/core';
import { FC, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { rendererAsyncRequestDispatcher as asyncRequest } from '../../common';
import { dispatch, fromCamelCase } from '../common';
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

export const CalibrateFragment: FC<CalibrateFragmentProps> = ({ entry }) => {
  const { fragmentId } = useParams<{ fragmentId: FragmentId }>();
  const { fileName } = entry;
  const result = entry.fragments.find((f) => f.id === fragmentId);
  const [testResult, setTestResult] =
    useState<BreachProtocolFragmentResults[number]>(result);
  const isBufferSize = fragmentId === 'bufferSize';
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

    const result = await asyncRequest<
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

    dispatch(new UpdateSettingsAction(payload));
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
            disabled={!testResult.isValid || isExperimental}
            color="accent"
            style={{ alignSelf: 'flex-end' }}
          >
            Update {fromCamelCase(fragmentId)} threshold
          </FlatButton>
        </Form>
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
            showBoxes={showBoxes}
            format={entry.settings.format}
          />
        )}
      </Col>
    </Row>
  );
};
