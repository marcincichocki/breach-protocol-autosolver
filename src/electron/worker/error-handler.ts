import { nativeDialog } from './dialog';

function globalErrorHandler(event: ErrorEvent | PromiseRejectionEvent) {
  event.preventDefault();

  const detail =
    event instanceof ErrorEvent ? event.message : event.reason.toString();

  nativeDialog.alert({
    type: 'error',
    message: 'Error occurred in worker process.',
    detail,
  });
}

window.addEventListener('error', globalErrorHandler);
window.addEventListener('unhandledrejection', globalErrorHandler);
