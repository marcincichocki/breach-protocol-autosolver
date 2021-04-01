import messages from './messages.json';

// ISO 639-1
export type Lang = keyof typeof messages;

let dict: typeof messages[Lang] = null;

export function setLang(lang: Lang) {
  if (!Object.keys(messages).includes(lang)) {
    throw new BreachProtocolError('TODO ADD MESSAGE');
  }

  dict = messages[lang];
}

/**
 * Translate message for given key and values.
 *
 * ```typescript
 * const m1 = t`SOME_KEY`;
 * const m2 = t`SOME_OTHER_KEY ${42} ${new Date().toLocaleString()}`;
 * ```
 *
 * NOTE: platform provider MUST call {@see setLang} before
 * using this function.
 *
 * @param keys Key of translation. NOTE: even though
 *     template string use array of strings as first
 *     element we only use 1st.
 * @param values Values to use in translation.
 * @returns Translated message.
 */
export function t(keys: TemplateStringsArray, ...values: any[]) {
  if (!dict) {
    throw new BreachProtocolError(' TODO: ADD MESSAGE ');
  }

  const key = keys[0].trim() as keyof typeof dict;

  if (!(key in dict)) {
    throw new BreachProtocolError('UNKNOWN_KEY_ERROR', key);
  }

  return dict[key].replace(/{(\d)}/g, (m, i) => values[i]);
}

export class BreachProtocolError extends Error {
  readonly name = this.constructor.name;

  constructor(key: string, ...values: string[]) {
    super(t.call(null, [key], values));
  }
}
