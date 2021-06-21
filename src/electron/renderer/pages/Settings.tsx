import {
  alert,
  AppSettings,
  optionsDescription,
  RemoveLastNHistoryEntriesAction,
  UpdateSettingsAction,
  WorkerStatus,
} from '@/electron/common';
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
import { dispatch, getDisplayName } from '../common';
import {
  Col,
  Field,
  File,
  Form,
  Label,
  RangeSlider,
  Select,
  Spinner,
  Switch,
  ThresholdSlider,
  useForm,
} from '../components';
import { KeyBind } from '../components/KeyBind';
import { StateContext } from '../state';

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

  &:not(:last-child) {
    margin-bottom: 1.5rem;
  }
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

const FieldDescription = ({ name }: { name: keyof AppSettings }) => {
  if (!optionsDescription[name]) {
    return <Description></Description>;
  }

  return <Description>{optionsDescription[name]}</Description>;
};

const GeneralSettings = ({ historySize }: { historySize: number }) => {
  const formatOptions = [
    { name: 'jpg', value: 'jpg' },
    { name: 'png', value: 'png' },
  ];

  async function onHistorySizeChange(
    value: number,
    next: (restart?: boolean) => void
  ) {
    if (value < historySize) {
      const { response } = await alert({
        title: 'this is title',
        message: 'message',
        buttons: ['ok delete', 'no get me out of here!'],
        cancelId: 1,
      });

      if (response === 1) {
        return next(true);
      }

      dispatch(new RemoveLastNHistoryEntriesAction(historySize - value));
    }

    next();
  }

  return (
    <Section title="General">
      <Field name="minimizeToTray">
        <Label>Minimize to tray</Label>
        <Switch />
      </Field>
      <Field name="historySize">
        <Label>History size</Label>
        <RangeSlider
          min={1}
          max={100}
          beforeValueChange={onHistorySizeChange}
        />
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
        <File accept=".mp3,.wav" />
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
  name: keyof AppSettings;
  label: string;
  switchName: keyof AppSettings;
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

  const { values } = useForm<AppSettings>();

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
  const displayOptions = displays.map((d) => ({
    name: getDisplayName(d),
    value: d.id,
  }));
  const ref = useDisplayOptionScrollTo();
  const { values } = useForm<AppSettings>();

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
          disabled={values.experimentalBufferSizeRecognition}
        />
      </Section>
    </>
  );
};

const SettingsWrapper = styled(Col)`
  max-width: 70%;
  margin: 0 auto;
  gap: 1rem;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export const Settings: FC = () => {
  const { settings, displays, status, history } = useContext(StateContext);
  const [activeField, setActiveField] = useState<keyof AppSettings>();

  function onValuesChange(values: AppSettings, name: keyof AppSettings) {
    const payload = { [name]: values[name] };

    console.log('updating form', payload);

    dispatch(new UpdateSettingsAction(payload));
  }

  return (
    <SettingsWrapper>
      {status !== WorkerStatus.Bootstrap ? (
        <>
          <FieldDescription name={activeField} />
          <Col
            style={{
              overflowY: 'auto',
              padding: '0 1rem',
            }}
          >
            <Form<AppSettings>
              initialValues={settings}
              onHover={setActiveField}
              onValuesChange={onValuesChange}
            >
              <GeneralSettings historySize={history.length} />
              <AutoSolverSettings />
              <RecognitionSettings displays={displays} />
            </Form>
          </Col>
        </>
      ) : (
        <Spinner />
      )}
    </SettingsWrapper>
  );
};
