import iohook from 'iohook';
import { options } from './cli';
import { FragmentId } from './ocr';
import { solveBreachProtocol } from './solve';
import { t } from './translate';

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
