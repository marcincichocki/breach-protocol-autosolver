import {
  AppSettings,
  optionsDescription,
  UpdateSettingsAction,
  WorkerStatus,
} from '@/electron/common';
import { useContext, useState } from 'react';
import styled from 'styled-components';
import {
  AutoSolverSettings,
  Col,
  Form,
  GeneralSettings,
  KeyBindsSettings,
  PerformanceSettings,
  RecognitionSettings,
  Spinner,
} from '../components';
import { StateContext } from '../state';

const Description = styled.p`
  color: var(--accent);
  font-size: 22px;
  font-weight: 500;
  min-height: 50px;
  margin: 0;
  text-align: center;
  width: 90vw;
`;

const FieldDescription = ({ name }: { name: keyof AppSettings }) => {
  if (!optionsDescription[name]) {
    return <Description></Description>;
  }

  return <Description>{optionsDescription[name]}</Description>;
};

const SettingsWrapper = styled(Col)`
  max-width: 70%;
  margin: 0 auto;
  gap: 1rem;
  flex-grow: 1;
  justify-content: center;
  align-items: center;
`;

export const Settings = () => {
  const { settings, displays, status, history } = useContext(StateContext);
  const [activeField, setActiveField] = useState<keyof AppSettings>();

  function onValuesChange(values: AppSettings, name: keyof AppSettings) {
    const payload = { [name]: values[name] };

    api.dispatch(new UpdateSettingsAction(payload));
  }

  return (
    <SettingsWrapper>
      {status !== WorkerStatus.Bootstrap ? (
        <>
          <FieldDescription name={activeField} />
          <Col
            scroll
            style={{
              padding: '0 1rem',
            }}
          >
            <Form<AppSettings>
              initialValues={settings}
              onHover={setActiveField}
              onValuesChange={onValuesChange}
            >
              <GeneralSettings historySize={history.length} />
              <KeyBindsSettings status={status} />
              <AutoSolverSettings />
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
