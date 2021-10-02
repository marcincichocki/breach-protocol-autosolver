import { app } from 'electron';
import { Main } from './main';

app.once('ready', () => {
  if (app.requestSingleInstanceLock()) {
    const main = new Main();

    main.init();
  } else {
    app.exit();
  }
});
