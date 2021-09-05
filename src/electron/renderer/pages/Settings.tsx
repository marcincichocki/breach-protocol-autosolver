import {
  AppSettings,
  NativeDialog,
  optionsDescription,
  RemoveLastNHistoryEntriesAction,
  SetStatusAction,
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
  OnBeforeValueChange,
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
    margin-bottom: 2rem;
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

  const onBeforeHistorySizeChange: OnBeforeValueChange<number> = async (
    value,
    next
  ) => {
    if (value < historySize) {
      const count = historySize - value;
      const entryText = count > 1 ? 'entries' : 'entry';
      const result = await NativeDialog.confirm({
        message: 'This action is irreversible!',
        detail: `${count} history ${entryText} will be deleted. Continue?`,
      });

      if (!result) {
        return next(true);
      }

      dispatch(new RemoveLastNHistoryEntriesAction(count));
    }

    next();
  };

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
          max={25}
          onBeforeValueChange={onBeforeHistorySizeChange}
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
        <Label>Source format</Label>
        <Select options={formatOptions} />
      </Field>
    </Section>
  );
};

let prevWorkerSatus: WorkerStatus = null;

function updateWorkerStatus(status: WorkerStatus) {
  dispatch(new SetStatusAction(status, 'renderer'));
}

const inputDeviceOptions = [
  { name: 'Keyboard(recommended)', value: 'keyboard' },
  { name: 'Mouse', value: 'mouse' },
];
const engineOptions =
  BUILD_PLATFORM === 'win32'
    ? [
        { name: 'NirCmd', value: 'nircmd' },
        { name: 'AutoHotkey', value: 'ahk' },
      ]
    : [{ name: 'xdotool', value: 'xdotool' }];

const AutoSolverSettings = ({ status }: { status: WorkerStatus }) => {
  const { values } = useForm<AppSettings>();

  function changeKeyBind(accelerator: Accelerator) {
    ipc.send('renderer:key-bind-change', accelerator);
  }

  function changeEngine(engine: string) {
    if (engine === 'ahk') {
      if (!values.ahkBinPath) {
        updateWorkerStatus(WorkerStatus.Disabled);
      }
    } else {
      // NOTE: this will line will always change worker status to ready, even if
      // status was not ready before engine value was changed.
      updateWorkerStatus(WorkerStatus.Ready);
    }
  }

  function changeAhkBinPath(path: string) {
    if (values.engine === 'ahk') {
      if (path) {
        // NOTE: same as above.
        updateWorkerStatus(WorkerStatus.Ready);
      } else {
        updateWorkerStatus(WorkerStatus.Disabled);
      }
    }
  }

  function onFocus() {
    prevWorkerSatus = status;
    updateWorkerStatus(WorkerStatus.Disabled);
  }

  function onBlur() {
    updateWorkerStatus(prevWorkerSatus);
  }

  async function notifyAboutEngine(value: string, next: () => void) {
    if (value === 'ahk' && !values.ahkBinPath) {
      const message =
        'This option requires AutoHotkey to be installed on the system.';
      await NativeDialog.alert({ message });
    }

    next();
  }

  async function notifyAboutInputDevice(value: string, next: () => void) {
    if (value === 'mouse') {
      const message =
        'Mouse input device is experimental feature and might not work correctly. Do you still want to use it?';
      const result = await NativeDialog.confirm({ message });

      if (!result) return;
    }

    next();
  }

  return (
    <Section title="AutoSolver">
      <Field name="keyBind" onValueChange={changeKeyBind}>
        <Label>Key bind</Label>
        <KeyBind onFocus={onFocus} onBlur={onBlur} />
      </Field>
      <Field name="soundEnabled">
        <Label>Sound</Label>
        <Switch />
      </Field>
      <Field name="errorSoundPath">
        <Label>Recognition error sound</Label>
        <File accept=".mp3,.wav" />
      </Field>
      <Field name="startSoundPath">
        <Label>Start sound</Label>
        <File accept=".mp3,.wav" />
      </Field>
      <Field name="delay">
        <Label>Delay(ms)</Label>
        <RangeSlider />
      </Field>
      <Field name="autoExit">
        <Label>Auto exit</Label>
        <Switch />
      </Field>
      <Field name="engine" onValueChange={changeEngine}>
        <Label>Engine</Label>
        <Select
          options={engineOptions}
          disabled={engineOptions.length === 1}
          onBeforeValueChange={notifyAboutEngine}
        />
      </Field>
      {values.engine === 'ahk' && (
        <Field name="ahkBinPath" onValueChange={changeAhkBinPath}>
          <Label>AutoHotkey path</Label>
          <File accept=".exe"></File>
        </Field>
      )}
      <Field name="outputDevice">
        <Label>Input device</Label>
        <Select
          options={inputDeviceOptions}
          onBeforeValueChange={notifyAboutInputDevice}
        />
      </Field>
      {values.outputDevice === 'mouse' && (
        <Field name="useScaling">
          <Label>Use display scaling</Label>
          <Switch />
        </Field>
      )}
    </Section>
  );
};

const PerformanceSettings = () => {
  async function onDownscaleSourceChange(value: boolean) {
    if (value) {
      await NativeDialog.alert({
        message: 'This option have no effect on resolutions smaller than 4k.',
        detail:
          "Automatic thresholds for grid and daemons fragments might stop working with downscaling turned on. It's recommended to set fixed thresholds.",
        buttons: ['I understand'],
      });
    }
  }

  async function onResolveDelayChange(value: number) {
    if (value && value <= 500) {
      await NativeDialog.alert({
        message: 'Resolve delay that low might have no effect.',
      });
    }
  }

  return (
    <Section title="Performance">
      <Field name="downscaleSource" onValueChange={onDownscaleSourceChange}>
        <Label>Downscale source image</Label>
        <Switch />
      </Field>
      <Field name="resolveDelay" onValueChange={onResolveDelayChange}>
        <Label>Resolve delay(ms)</Label>
        <RangeSlider min={0} max={1500} step={100} />
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
              <AutoSolverSettings status={status} />
              <PerformanceSettings />
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
