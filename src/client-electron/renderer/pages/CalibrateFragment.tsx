import { HistoryEntry, TestThresholdData } from '@/client-electron/common';
import { BreachProtocolFragmentResults, FragmentId } from '@/core';
import { FC, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
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
import { Field, FieldContext, Form, Label } from '../components/Form';

interface CalibrateFragmentProps {
  entry: HistoryEntry;
}

const ThresholdUpdater = ({
  threshold,
}: {
  threshold: number;
}): JSX.Element => {
  const { setValue } = useContext(FieldContext);

  useEffect(() => {
    setValue(threshold, { emit: false });
  }, [threshold]);

  return null;
};

export const CalibrateFragment: FC<CalibrateFragmentProps> = ({ entry }) => {
  const { fragmentId } = useParams<{ fragmentId: FragmentId }>();
  const { fileName } = entry;
  const result = entry.fragments.find((f) => f.id === fragmentId);
  const [testResult, setTestResult] =
    useState<BreachProtocolFragmentResults[number]>(result);
  const disableRangeSlider =
    entry.options.experimentalBufferSizeRecognition &&
    fragmentId === 'bufferSize';
  const [loading, setLoading] = useState<boolean>(false);
  const [showBoxes, setShowBoxes] = useState(false);
  const [testThreshold, setTestThreshold] = useState<number>(result.threshold);

  useEffect(() => {
    setTestResult(result);
    setTestThreshold(result.threshold);
  }, [fragmentId]);

  async function onTestThreshold(threshold: number) {
    setLoading(true);

    const result = await dispatch<
      BreachProtocolFragmentResults[number],
      TestThresholdData
    >({
      type: 'TEST_THRESHOLD',
      data: { fileName, threshold, fragmentId },
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
        <Form initialValues={{ showBoxes, testThreshold }}>
          <Field name="showBoxes" onValueChange={setShowBoxes}>
            <Label>Show boxes</Label>
            <Switch />
          </Field>
          <Field name="testThreshold" onValueChange={onTestThreshold}>
            <Label>Test threshold</Label>
            <RangeSlider
              min={0}
              max={255}
              disabled={loading || disableRangeSlider}
            />
            <ThresholdUpdater threshold={testThreshold} />
          </Field>
        </Form>
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
            showBoxes={showBoxes}
          />
        )}
      </Col>
    </Row>
  );
};
