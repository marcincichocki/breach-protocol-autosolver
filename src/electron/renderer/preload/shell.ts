import { shell } from 'electron';

export const { showItemInFolder } = shell;

export function openResourcesFolder() {
  // NOTE: this will point to incorrect folder while in development mode.
  return shell.openPath(process.resourcesPath);
}
