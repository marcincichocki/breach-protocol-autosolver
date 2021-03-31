import { InvalidOptionArgumentError, Option } from 'commander';

function parser(value: string) {
  const list = value.split(',').filter(Boolean).map(Number);
  const isInvalid = !list.every((k) => Number.isInteger(k));

  if (isInvalid) {
    throw new InvalidOptionArgumentError('Option "--key-bind" is invalid.');
  }

  return list;
}

const defaultValue = [29, 83];
const flags = '-k, --key-bind <commaSeparatedKeyCodesList>';
const description = `Key codes which trigger autosolver. Default combination: "LeftControl+NumPadDel". Key codes list: https://github.com/wilix-team/iohook/blob/v0.6.6/libuiohook/include/uiohook.h`;

export const keyBind = new Option(flags, description)
  .argParser(parser)
  .default(defaultValue, defaultValue.join(','));
