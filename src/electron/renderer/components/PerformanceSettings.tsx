import { nativeDialog } from '../common';
import { Field, Label } from './Form';
import { RangeSlider } from './RangeSlider';
import { Section } from './Section';
import { Select } from './Select';
import { Switch } from './Switch';

const formatOptions = [
  { name: 'jpg(speed)', value: 'jpg' },
  { name: 'png(quality)', value: 'png' },
];

async function onDownscaleSourceChange(value: boolean) {
  if (value) {
    await nativeDialog.alert({
      message: 'This option have no effect on resolutions smaller than 4k.',
      detail:
        "Automatic thresholds for grid and daemons fragments might stop working with downscaling turned on. It's recommended to set fixed thresholds.",
      buttons: ['I understand'],
    });
  }
}

async function onResolveDelayChange(value: number) {
  if (value && value <= 500) {
    await nativeDialog.alert({
      message: 'Resolve delay that low might have no effect.',
    });
  }
}

export const PerformanceSettings = () => {
  return (
    <Section title="Performance">
      <Field name="format">
        <Label>Source format</Label>
        <Select options={formatOptions} />
      </Field>
      <Field name="downscaleSource" onValueChange={onDownscaleSourceChange}>
        <Label>Downscale source image</Label>
        <Switch />
      </Field>
      <Field name="delay">
        <Label>Delay(ms)</Label>
        <RangeSlider />
      </Field>
      <Field name="resolveDelay" onValueChange={onResolveDelayChange}>
        <Label>Resolve delay(ms)</Label>
        <RangeSlider min={0} max={1500} step={100} />
      </Field>
      <Field name="skipTypesFragment">
        <Label>Skip types fragment</Label>
        <Switch />
      </Field>
    </Section>
  );
};
