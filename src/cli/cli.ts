import { Command } from 'commander';

const { version, name } = require('../../package.json');

const program = new Command(name);

program
  .version(version)
  .option('-k, --key-bind', 'key to bind autosolver to', '29,83');

program.parse();

console.log(program.opts());
