import { app } from 'electron';
import { Main } from './main';

app.once('ready', () => {
  const main = new Main();

  main.init();
});
