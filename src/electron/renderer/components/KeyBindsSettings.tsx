import {
  BreachProtocolCommands,
  KeyBindsConfig,
  KeyBindValidationErrors,
  WorkerStatus,
} from '@/electron/common';
import type { Accelerator } from 'electron';
import {
  createErrorMessageDispenser,
  nativeDialog,
  updateWorkerStatus,
} from '../common';
import { AcceleratorKeyBind } from './AcceleratorKeyBind';
import { Field, Label } from './Form';
import { Section } from './Section';

let prevWorkerSatus: WorkerStatus = null;

const commands: Record<keyof KeyBindsConfig, BreachProtocolCommands> = {
  keyBind: 'worker:solve',
  keyBindWithPriority1: 'worker:solve.withPriority1',
  keyBindWithPriority2: 'worker:solve.withPriority2',
  keyBindWithPriority3: 'worker:solve.withPriority3',
  keyBindWithPriority4: 'worker:solve.withPriority4',
  keyBindWithPriority5: 'worker:solve.withPriority5',
  keyBindAnalyze: 'worker:analyze',
};

function changeKeyBind(accelerator: Accelerator, name: keyof KeyBindsConfig) {
  const id = commands[name];

  api.send('main:key-bind-change', id, accelerator);
}

const getErrorDetail = createErrorMessageDispenser({
  isValidAccelerator:
    'Key bind can contain multiple modifiers and a single key code.',
  isUnique: 'Key bind must be unique.',
  canRegister: 'Key bind is alredy registered in other application.',
});

async function validateKeyBind(
  value: Electron.Accelerator,
  next: (reset?: boolean) => void
) {
  const errors = await api.invoke<KeyBindValidationErrors>(
    'main:validate-key-bind',
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
      <Field name="keyBindAnalyze" onValueChange={changeKeyBind}>
        <Label>Analyze</Label>
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
