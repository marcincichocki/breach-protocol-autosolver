import { NativeDialog } from '../common';

export function globalErrorHandler(event: ErrorEvent | PromiseRejectionEvent) {
  event.preventDefault();

  NativeDialog.alert({
    title: 'Error',
    type: 'error',
    message: 'Error occurred in worker process.',
    detail: event instanceof ErrorEvent ? event.message : event.reason,
  });
}
