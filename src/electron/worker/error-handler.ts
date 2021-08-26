import { NativeDialog } from '../common';

function globalErrorHandler(event: ErrorEvent | PromiseRejectionEvent) {
  event.preventDefault();

  const detail =
    event instanceof ErrorEvent ? event.message : event.reason.toString();

  NativeDialog.alert({
    title: 'Error',
    type: 'error',
    message: 'Error occurred in worker process.',
    detail,
  });
}

window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', globalErrorHandler);
