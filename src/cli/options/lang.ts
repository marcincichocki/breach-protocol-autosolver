import { Option } from 'commander';
import messages from '../../messages.json';
import { Lang } from '../../translate';

const availableLangs = Object.keys(messages) as Lang[];
const flags = '--lang <lang>';
const description = 'Language of text interface.';

export interface LangOption {
  lang: Lang;
}

export const langOption = new Option(flags, description)
  .choices(availableLangs)
  .default('en');
