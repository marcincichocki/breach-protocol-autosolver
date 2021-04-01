import { InvalidOptionArgumentError, Option } from 'commander';

export function parser(value: string) {
  const list = value.split(',').filter(Boolean).map(Number);
  const isInvalid =
    !list.length || !list.every((k) => Number.isInteger(k) && k > 0);

  if (isInvalid) {
    throw new InvalidOptionArgumentError(
      'Must be comma separated list of numbers'
    );
  }

  return list;
}

export interface KeyBindOption {
  keyBind: number[];
}

const defaultValue = [29, 83];
const flags = '--key-bind <commaSeparatedKeyCodesList>';
const description = `Key codes which trigger autosolver. Default combination: "LeftControl+NumPadDel". Key codes list: https://github.com/wilix-team/iohook/blob/v0.6.6/libuiohook/include/uiohook.h`;

export const keyBindOption = new Option(flags, description)
  .argParser(parser)
  .default(defaultValue, defaultValue.join(','));
