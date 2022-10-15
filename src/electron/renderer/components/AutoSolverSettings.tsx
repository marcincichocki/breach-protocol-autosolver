import { AppSettings, WorkerStatus } from '@/electron/common';
import { useState } from 'react';
import { nativeDialog, updateWorkerStatus } from '../common';
import { FlatButton } from './Buttons';
import { DaemonPriority } from './DaemonPriority';
import { File } from './File';
import { Spacer } from './Flex';
import { Field, Label, useForm } from './Form';
import { Section } from './Section';
import { Select, SelectOption } from './Select';
import { ShallowKeyBind } from './ShallowKeyBind';
import { Switch } from './Switch';

const inputDeviceOptions = [
  { name: 'Keyboard(recommended)', value: 'keyboard' },
  { name: 'Mouse', value: 'mouse' },
];
const hierarchyOptions: SelectOption[] = [
  { name: 'Index', value: 'index' },
  { name: 'Types', value: 'types' },
];

const engineOptions =
  BUILD_PLATFORM === 'win32'
    ? [
        { name: 'NirCmd', value: 'nircmd' },
        { name: 'AutoHotkey', value: 'ahk' },
      ]
    : [{ name: 'xdotool', value: 'xdotool' }];

export const AutoSolverSettings = () => {
  const { values } = useForm<AppSettings>();
  const [isOpen, setIsOpen] = useState(false);

  function changeEngine(engine: string) {
    if (engine === 'ahk') {
      if (!values.ahkBinPath) {
        updateWorkerStatus(WorkerStatus.Disabled);
      }
    } else {
      // NOTE: this line will always change worker status to ready, even if
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

  async function notifyAboutEngine(value: string, next: () => void) {
    if (value === 'ahk' && !values.ahkBinPath) {
      const message =
        'This option requires AutoHotkey to be installed on the system.';
      await nativeDialog.alert({ message });
    }

    next();
  }

  async function notifyAboutInputDevice(value: string, next: () => void) {
    if (value === 'mouse') {
      const message =
        'Mouse input device is experimental feature and might not work correctly. Do you still want to use it?';
      const result = await nativeDialog.confirm({ message });

      if (!result) return;
    }

    next();
  }

  return (
    <Section title="AutoSolver">
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
      <Field name="autoExit">
        <Label>Auto exit</Label>
        <Switch />
      </Field>
      <Field name="hierarchy">
        <Label>Hierarchy</Label>
        <Select
          options={hierarchyOptions}
          disabled={values.skipTypesFragment}
        />
      </Field>
      {values.hierarchy === 'types' && (
        <Field name="daemonPriority">
          <Label>Daemon priority</Label>
          <Spacer />
          <FlatButton
            color="accent"
            type="button"
            onClick={() => setIsOpen(true)}
          >
            Change priority
          </FlatButton>
          <DaemonPriority isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </Field>
      )}
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
      {values.outputDevice === 'mouse' ? (
        <Field name="useScaling">
          <Label>Use display scaling</Label>
          <Switch />
        </Field>
      ) : (
        <>
          <Field name="keySelect">
            <Label>"Select" key</Label>
            <ShallowKeyBind />
          </Field>
          <Field name="keyExit">
            <Label>"Exit" key</Label>
            <ShallowKeyBind />
          </Field>
          <Field name="keyNavigateUp">
            <Label>"Navigate up" key</Label>
            <ShallowKeyBind />
          </Field>
          <Field name="keyNavigateDown">
            <Label>"Navigate down" key</Label>
            <ShallowKeyBind />
          </Field>
          <Field name="keyNavigateLeft">
            <Label>"Navigate left" key</Label>
            <ShallowKeyBind />
          </Field>
          <Field name="keyNavigateRight">
            <Label>"Navigate right" key</Label>
            <ShallowKeyBind />
          </Field>
        </>
      )}
    </Section>
  );
};
