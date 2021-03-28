import messages from './messages.json';
import { options } from './util';

// ISO 639-1
export type Lang = 'en' | 'pl';

const dict = messages[options.lang as Lang];

/**
 * Translate message for given key and values.
 *
 * ```typescript
 * const m1 = t`SOME_KEY`;
 * const m2 = t`SOME_OTHER_KEY ${42} ${new Date().toLocaleString()}`;
 * ```
 *
 * @param keys Key of translation. NOTE: even though
 *     template string use array of strings as first
 *     element we only use 1st.
 * @param values Values to use in translation.
 * @returns Translated message.
 */
export function t(keys: TemplateStringsArray, ...values: any[]) {
  const key = keys[0].trim() as keyof typeof dict;

  if (!(key in dict)) {
    throw new Error(t`UNKNOWN_KEY_ERROR ${key}`);
  }

  return dict[key].replace(/{(\d)}/g, (m, i) => values[i]);
}
