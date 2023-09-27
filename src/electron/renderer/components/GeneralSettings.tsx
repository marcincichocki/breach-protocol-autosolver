import { RemoveLastNHistoryEntriesAction } from '@/electron/common';
import { getPatchName, nativeDialog } from '../common';
import { Field, Label, OnBeforeValueChange } from './Form';
import { RangeSlider } from './RangeSlider';
import { Section } from './Section';
import { Switch } from './Switch';
import { Select, SelectOption } from './Select';

const patches = ['1.x', '2.x'] as const;
const patchOptions: SelectOption<string>[] = patches.map((value) => ({
  value,
  name: getPatchName(value),
}));

export const GeneralSettings = ({ historySize }: { historySize: number }) => {
  const onBeforeHistorySizeChange: OnBeforeValueChange<number> = async (
    value,
    next
  ) => {
    if (value < historySize) {
      const count = historySize - value;
      const entryText = count > 1 ? 'entries' : 'entry';
      const result = await nativeDialog.confirm({
        message: 'This action is irreversible!',
        detail: `${count} history ${entryText} will be deleted. Continue?`,
      });

      if (!result) {
        return next(true);
      }

      api.dispatch(new RemoveLastNHistoryEntriesAction(count));
    }

    next();
  };

  return (
    <Section title="General">
      <Field name="patch">
        <Label>Cyberpunk patch</Label>
        <Select options={patchOptions}></Select>
      </Field>
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
      <Field name="sortDaemonsBySequence">
        <Label>Sort daemons by sequence</Label>
        <Switch />
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
      <Field name="focusOnError">
        <Label>Focus on error</Label>
        <Switch />
      </Field>
    </Section>
  );
};
