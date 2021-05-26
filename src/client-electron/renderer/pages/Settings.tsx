import { Action } from '@/client-electron/common';
import { Accelerator, ipcRenderer as ipc } from 'electron';
import { FC, useContext, useState } from 'react';
import styled from 'styled-components';
import {
  Col,
  RangeSlider,
  Select,
  Switch,
  File,
  Field,
  Form,
  Label,
} from '../components';
import { KeyBind } from '../components/KeyBind';
import { StateContext } from '../state';

function dispatch(action: Omit<Action, 'origin'>) {
  return ipc.send('state', { ...action, origin: 'renderer' });
}

const Header = styled.h1`
  background: var(--background-disabled);
  color: #fff;
  border-top: 2px solid var(--accent);
  font-size: 32px;
  font-weight: 500;
  padding: 0 1rem;
`;

const Description = styled.p`
  color: var(--accent);
  font-size: 22px;
  font-weight: 500;
  min-height: 50px;
  margin: 0;
  text-align: center;
`;

const descriptions: Record<string, any> = {
  activeDisplayId: 'Hello world',
  autoUpdate: 'this is auto update haha',
};

const FieldDescription = ({ name }: any) => {
  if (!descriptions[name]) {
    return <Description></Description>;
  }

  return <Description>{descriptions[name]}</Description>;
};

const SettingsForm = ({ displayOptions }: any) => {
  const formatOptions = [
    { name: 'jpg', value: 'jpg' },
    { name: 'png', value: 'png' },
  ];

  function changeKeyBind(accelerator: Accelerator) {
    ipc.send('renderer:key-bind-change', accelerator);
  }

  return (
    <>
      <Field name="keyBind" onValueChange={changeKeyBind}>
        <Label>Key bind</Label>
        <KeyBind />
      </Field>
      <Field name="activeDisplayId">
        <Select
          options={displayOptions}
          disabled={displayOptions.length === 1}
        />
        <Label>Display</Label>
      </Field>
      <Field name="autoUpdate">
        <Label>Auto update</Label>
        <Switch />
      </Field>
      <Field name="delay">
        <Label>Delay</Label>
        <RangeSlider />
      </Field>
      <Field name="disableAutoExit">
        <Label>Disable auto exit</Label>
        <Switch />
      </Field>
      <Field name="disableSound">
        <Label>Disable sound</Label>
        <Switch />
      </Field>
      <Field name="experimentalBufferSizeRecognition">
        <Label>Experimental shit</Label>
        <Switch />
      </Field>
      <Field name="format">
        <Label>Format</Label>
        <Select options={formatOptions} />
      </Field>
      <Field name="historySize">
        <Label>History size</Label>
        <RangeSlider min={1} max={100} />
      </Field>
      <Field name="preserveSourceOnSuccess">
        <Label>Preserve sources</Label>
        <Switch />
      </Field>
      <Field name="skipUpdateCheck">
        <Label>Skip update check</Label>
        <Switch />
      </Field>
      <Field name="soundPath">
        <Label>Sound path</Label>
        <File />
      </Field>
      <Field name="scaling">
        <Label>Scaling</Label>
        <Switch />
      </Field>
    </>
  );
};

export const Settings: FC = () => {
  const { settings, displays } = useContext(StateContext);
  const displayOptions = displays.map(({ id, name }) => ({ name, value: id }));
  const [activeField, setActiveField] = useState<string>();

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
          padding: '1rem',
        }}
      >
        <Form
          initialValues={settings as any}
          onHover={setActiveField}
          onValuesChange={console.log}
        >
          <SettingsForm displayOptions={displayOptions} />
        </Form>
      </Col>
    </Col>
  );
};
