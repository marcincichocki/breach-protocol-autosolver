import type { BreachProtocolLanguage } from '@/core/daemons-i18n';
import { AppSettings } from '@/electron/common';
import { nativeDialog } from '../common';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import type { ScreenshotDisplayOutput } from 'screenshot-desktop';
import { getDisplayName } from '../common';
import { Field, Label, useForm } from './Form';
import { RangeSlider, ThresholdSlider } from './RangeSlider';
import { Section } from './Section';
import { Select, SelectOption } from './Select';
import { Switch } from './Switch';
import { BUFFER_SIZE_MAX } from '@/core';

const gameLanguageOptions: SelectOption<BreachProtocolLanguage>[] = [
  { name: 'polski', value: 'pol' },
  { name: 'English', value: 'eng' },
  { name: 'español', value: 'spa' },
  { name: 'français', value: 'fra' },
  { name: 'italiano', value: 'ita' },
  { name: 'Deutsch', value: 'deu' },
  // NOTE: LA uses same traineddata as base spanish
  { name: 'Español (AL)', value: 'spa' },
  { name: '한국어', value: 'kor' },
  { name: '中文(简体)', value: 'chi_sim' },
  { name: 'русский', value: 'rus' },
  { name: 'Português do Brasil', value: 'por' },
  { name: '日本語', value: 'jpn' },
  { name: '中文(繁體)', value: 'chi_tra' },
  { name: 'العربية', value: 'ara' },
  { name: 'český', value: 'ces' },
  { name: 'magyar', value: 'hun' },
  { name: 'Türkçe', value: 'tur' },
  { name: 'ไทย', value: 'tha+eng' },
];

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

export const RecognitionSettings = ({
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

  function createBufferSizeNotifier<T>(predicate: (value: T) => boolean) {
    return async (value: T, next: () => void) => {
      if (predicate(value)) {
        const message =
          values.strategy === 'dps'
            ? 'Using modded buffer with together with depth-first search strategy might result in poor performance.'
            : 'Path permutations might be limited to prevent severe performance downgrade. It is possible that some solutions will not be found.';
        await nativeDialog.alert({ message });
      }

      next();
    };
  }

  const notifyAboutExtendedBufferSizeRange = createBufferSizeNotifier<boolean>(
    (v) => v
  );
  const notifyAboutFixedBufferSize = createBufferSizeNotifier<number>(
    (v) => v > BUFFER_SIZE_MAX
  );

  return (
    <Section title="Recognition">
      <Field ref={ref} name="activeDisplayId">
        <Label>Display</Label>
        <Select
          options={displayOptions}
          disabled={displayOptions.length === 1}
        />
      </Field>
      <Field name="gameLang">
        <Label>Game language</Label>
        <Select options={gameLanguageOptions} />
      </Field>
      <Field name="filterRecognizerResults">
        <Label>Filter OCR results</Label>
        <Switch />
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
      <ThresholdField
        name="thresholdTypes"
        switchName="thresholdTypesAuto"
        label="Types threshold"
        switchLabel="Automatic types threshold"
      />
      <Field name="useFixedBufferSize">
        <Label>Use fixed buffer size</Label>
        <Switch />
      </Field>
      {values.useFixedBufferSize ? (
        <Field name="fixedBufferSize">
          <Label>Fixed buffer size</Label>
          <RangeSlider
            min={4}
            max={99}
            step={1}
            onBeforeValueChange={notifyAboutFixedBufferSize}
          />
        </Field>
      ) : (
        <>
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
          <Field name="extendedBufferSizeRecognitionRange">
            <Label>Extended buffer size range</Label>
            <Switch onBeforeValueChange={notifyAboutExtendedBufferSizeRange} />
          </Field>
        </>
      )}
      <Field name="extendedDaemonsAndTypesRecognitionRange">
        <Label>Extended daemons and type range</Label>
        <Switch />
      </Field>
    </Section>
  );
};
