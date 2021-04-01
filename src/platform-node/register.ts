import { t } from '@/common';
import { FragmentId } from '@/core';
import iohook from 'iohook';
import { options } from './cli';
import { solveBreachProtocol } from './solve';

export function register({
  workers,
  screenId,
}: {
  workers: Record<FragmentId, Tesseract.Worker>;
  screenId: string;
}) {
  const ready = t`READY`;
  let isRunning = false;

  const id = iohook.registerShortcut(options.keyBind, async () => {
    if (isRunning) return;
    isRunning = true;

    await solveBreachProtocol(workers, screenId);

    console.info(ready);
    isRunning = false;
  });

  iohook.start();
  console.info(ready);

  return id;
}
