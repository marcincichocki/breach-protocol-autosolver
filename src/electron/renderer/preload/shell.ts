import { shell } from 'electron';

export const { showItemInFolder } = shell;

// TODO: add repo url to constants.
const urlWhitelist = ['https://github.com'];

/** Wrapper around {@link shel.openExternal}. Accepts only curated list of urls. */
export function openExternal(
  url: string,
  options?: Electron.OpenExternalOptions
) {
  if (urlWhitelist.some((w) => w.startsWith(url))) {
    return shell.openExternal(url, options);
  }

  throw new Error(`Invalid url: "${url}" provided.`);
}
