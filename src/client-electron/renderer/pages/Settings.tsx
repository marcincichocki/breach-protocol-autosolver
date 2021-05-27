import { Action } from '@/client-electron/common';
import { Accelerator, ipcRenderer as ipc } from 'electron';
import {
  FC,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { ScreenshotDisplayOutput } from 'screenshot-desktop';
import styled from 'styled-components';
import {
  Col,
  Field,
  File,
  Form,
  Label,
  RangeSlider,
  Select,
  Switch,
  ThresholdSlider,
  useForm,
} from '../components';
import { KeyBind, KeyCode } from '../components/KeyBind';
import { StateContext } from '../state';

function dispatch(action: Omit<Action, 'origin'>) {
  return ipc.send('state', { ...action, origin: 'renderer' });
}

const Header = styled.h1`
  background: rgba(22, 18, 32, 0.5);
  color: #fff;
  border-top: 2px solid var(--accent);
  font-size: 26px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  margin: 0;
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const Section = ({ title, children }: PropsWithChildren<{ title: string }>) => {
  return (
    <StyledSection>
      <Header>{title}</Header>
      {children}
    </StyledSection>
  );
};

const Description = styled.p`
  color: var(--accent);
  font-size: 22px;
  font-weight: 500;
  min-height: 50px;
  margin: 0;
  text-align: center;
`;

const descriptions: Record<string, any> = {};

const FieldDescription = ({ name }: any) => {
  if (!descriptions[name]) {
    return <Description></Description>;
  }

  return <Description>{descriptions[name]}</Description>;
};

const GeneralSettings = () => {
  const formatOptions = [
    { name: 'jpg', value: 'jpg' },
    { name: 'png', value: 'png' },
  ];

  return (
    <Section title="General">
      <Field name="historySize">
        <Label>History size</Label>
        <RangeSlider min={1} max={100} />
      </Field>
      <Field name="preserveSourceOnSuccess">
        <Label>Preserve sources</Label>
        <Switch />
      </Field>
      <Field name="checkForUpdates">
        <Label>Check for updates</Label>
        <Switch />
      </Field>
      <Field name="autoUpdate">
        <Label>Auto update</Label>
        <Switch />
      </Field>
      <Field name="format">
        <Label>Format</Label>
        <Select options={formatOptions} />
      </Field>
    </Section>
  );
};

const AutoSolverSettings = () => {
  function changeKeyBind(accelerator: Accelerator) {
    ipc.send('renderer:key-bind-change', accelerator);
  }

  return (
    <Section title="AutoSolver">
      <Field name="keyBind" onValueChange={changeKeyBind}>
        <Label>Key bind</Label>
        <KeyBind />
      </Field>
      <Field name="soundEnabled">
        <Label>Sound</Label>
        <Switch />
      </Field>
      <Field name="errorSoundPath">
        <Label>Error sound path</Label>
        <File />
      </Field>
      <Field name="delay">
        <Label>Delay</Label>
        <RangeSlider />
      </Field>
      <Field name="autoExit">
        <Label>Auto exit</Label>
        <Switch />
      </Field>
      <Field name="useScaling">
        <Label>Scaling</Label>
        <Switch />
      </Field>
    </Section>
  );
};

function useDisplayOptionScrollTo<T extends HTMLDivElement>() {
  const ref = useRef<T>();
  const location = useLocation();

  useEffect(() => {
    if (location.search.includes('goToDisplay')) {
      ref.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [location.search]);

  return ref;
}

interface ThresholdFieldProps {
  name: string;
  label: string;
  switchName: string;
  switchLabel: string;
  disabled?: boolean;
}

const ThresholdField = ({
  switchLabel,
  label,
  name,
  switchName,
  disabled,
}: ThresholdFieldProps) => {
  if (disabled) {
    return null;
  }

  const { values } = useForm();

  return (
    <>
      <Field name={switchName}>
        <Label>{switchLabel}</Label>
        <Switch />
      </Field>
      {!values[switchName] && (
        <Field name={name}>
          <Label>{label}</Label>
          <ThresholdSlider disabled={values[switchName] as boolean} />
        </Field>
      )}
    </>
  );
};

const RecognitionSettings = ({
  displays,
}: {
  displays: ScreenshotDisplayOutput[];
}) => {
  const displayOptions = displays.map(({ id, name }) => ({ name, value: id }));
  const ref = useDisplayOptionScrollTo();
  const { values } = useForm();

  return (
    <>
      <Section title="Recognition">
        <Field ref={ref} name="activeDisplayId">
          <Label>Display</Label>
          <Select
            options={displayOptions}
            disabled={displayOptions.length === 1}
          />
        </Field>
        <ThresholdField
          name="thresholdGrid"
          switchName="thresholdGridAuto"
          label="Grid threshold"
          switchLabel="Automatic grid threshold"
        />
        <ThresholdField
          name="thresholdDaemons"
          switchName="thresholdDaemonsAuto"
          label="Daemons threshold"
          switchLabel="Automatic daemons threshold"
        />
        <Field name="experimentalBufferSizeRecognition">
          <Label>Experimental buffer size recognition</Label>
          <Switch />
        </Field>
        <ThresholdField
          name="thresholdBufferSize"
          switchName="thresholdBufferSizeAuto"
          label="Buffer size threshold"
          switchLabel="Automatic buffer size threshold"
          disabled={values['experimentalBufferSizeRecognition'] as boolean}
        />
      </Section>
    </>
  );
};

export const Settings: FC = () => {
  const { settings, displays } = useContext(StateContext);
  const [activeField, setActiveField] = useState<string>();

  function onValuesChange(payload: Record<string, any>) {
    dispatch({ type: 'SET_SETTINGS', payload });
  }

  return (
    <Col
      style={{
        maxWidth: '70%',
        margin: '0 auto',
        gap: '1rem',
        flexGrow: 1,
      }}
    >
      <FieldDescription name={activeField} />
      <Col
        style={{
          overflowY: 'auto',
          padding: '0 1rem',
        }}
      >
        <Form
          initialValues={settings as any}
          onHover={setActiveField}
          onValuesChange={onValuesChange}
        >
          <GeneralSettings />
          <AutoSolverSettings />
          <RecognitionSettings displays={displays} />
        </Form>
      </Col>
    </Col>
  );
};
