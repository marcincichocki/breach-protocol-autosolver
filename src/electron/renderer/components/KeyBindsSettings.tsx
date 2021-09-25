import {
  BreachProtocolCommands,
  KeyBindsConfig,
  KeyBindValidationErrors,
  SetStatusAction,
  WorkerStatus,
} from '@/electron/common';
import type { Accelerator } from 'electron';
import { nativeDialog } from '../common';
import { AcceleratorKeyBind } from './AcceleratorKeyBind';
import { Field, Label } from './Form';
import { Section } from './Section';

let prevWorkerSatus: WorkerStatus = null;

function updateWorkerStatus(status: WorkerStatus) {
  api.dispatch(new SetStatusAction(status, 'renderer'));
}

const commands: Record<keyof KeyBindsConfig, BreachProtocolCommands> = {
  keyBind: 'worker:solve',
  keyBindWithPriority1: 'worker:solve.withPriority1',
  keyBindWithPriority2: 'worker:solve.withPriority2',
  keyBindWithPriority3: 'worker:solve.withPriority3',
  keyBindWithPriority4: 'worker:solve.withPriority4',
  keyBindWithPriority5: 'worker:solve.withPriority5',
};

function changeKeyBind(accelerator: Accelerator, name: keyof KeyBindsConfig) {
  const id = commands[name];

  api.send('renderer:key-bind-change', id, accelerator);
}

const messages: Record<keyof KeyBindValidationErrors, string> = {
  isValidAccelerator:
    'Key bind can contain multiple modifiers and a single key code.',
  isUnique: 'Key bind must be unique.',
};

function getErrorDetail(errors: KeyBindValidationErrors) {
  const keys = Object.keys(errors) as (keyof KeyBindValidationErrors)[];
  const key = keys.find((k) => !errors[k]);

  return messages[key];
}

async function validateKeyBind(
  value: Electron.Accelerator,
  next: (reset?: boolean) => void
) {
  const errors = await api.invoke<KeyBindValidationErrors>(
    'renderer:validate-key-bind',
    value
  );

  if (!errors) {
    next();
  } else {
    next(true);

    const detail = getErrorDetail(errors);

    await nativeDialog.alert({ message: 'Invalid key bind', detail });
  }
}

export const KeyBindsSettings = ({ status }: { status: WorkerStatus }) => {
  function onFocus() {
    prevWorkerSatus = status;
    updateWorkerStatus(WorkerStatus.Disabled);
  }

  function onBlur() {
    updateWorkerStatus(prevWorkerSatus);
  }

  return (
    <Section title="Key bindings">
      <Field name="keyBind" onValueChange={changeKeyBind}>
        <Label>Solve</Label>
        <AcceleratorKeyBind
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
      <Field name="keyBindWithPriority1" onValueChange={changeKeyBind}>
        <Label>Solve with priority 1</Label>
        <AcceleratorKeyBind
          allowRemove
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
      <Field name="keyBindWithPriority2" onValueChange={changeKeyBind}>
        <Label>Solve with priority 2</Label>
        <AcceleratorKeyBind
          allowRemove
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
      <Field name="keyBindWithPriority3" onValueChange={changeKeyBind}>
        <Label>Solve with priority 3</Label>
        <AcceleratorKeyBind
          allowRemove
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
      <Field name="keyBindWithPriority4" onValueChange={changeKeyBind}>
        <Label>Solve with priority 4</Label>
        <AcceleratorKeyBind
          allowRemove
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
      <Field name="keyBindWithPriority5" onValueChange={changeKeyBind}>
        <Label>Solve with priority 5</Label>
        <AcceleratorKeyBind
          allowRemove
          onFocus={onFocus}
          onBlur={onBlur}
          onBeforeValueChange={validateKeyBind}
        />
      </Field>
    </Section>
  );
};
