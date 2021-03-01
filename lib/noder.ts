#!/usr/bin/env node
import arg from 'arg';
import fs from 'fs';
import path from 'path';
import { Noder } from '.';

const args = arg({
  '--help': Boolean,
  '--version': Boolean,
  '--forever': Boolean,
  '--no-node': Boolean,
  '--config': String,
  '--restart': String,
  '--terminate': String,

  '-h': '--help',
  '-v': '--version',
  '-f': '--forever',
  '-N': '--no-node',
  '-c': '--config',
});

if (args['--version']) {
  const { version } = JSON.parse(
    fs.readFileSync(path.join(__dirname, '../package.json'), 'utf8')
  );

  console.log(`noder v${version}`);

  process.exit();
}

if (args['--help']) {
  console.log(`noder: node + restart
https://github.com/dotandl/noder

This script allows you to start any node.js script with ability to self-restart.
The only thing you need to do that is to write console.log('[noder:restart]');

noder can also run other scripts/programs (not only node),
terminate them (like restart using console.log above) and run them in forever mode.

Usage: noder [options] <script.js> [args]

Options:
  -h, --help\t - Displays noder's help
  -v, --version\t - Displays noder's version
  -f, --forever\t - Enables forever mode
  -N, --no-node\t - Disables node script execution mode
\t\t   (you can execute any shell command)
  -c, --config\t - Loads custom config file
  --restart\t - Defines custom restart directive
  --terminate\t - Defines custom terminate directive

By default noder loads its own config file if it's placed in /current/working/dir/noder.json
(can be changed using -c/--config option).`);

  process.exit();
}

interface Config {
  file: string;
  args?: string[];
  forever?: boolean;
  noNode?: boolean;
  directives?: { restart?: string; terminate?: string };
}

const config: Config = { file: '' };

if (args['--forever']) config.forever = args['--forever'];
if (args['--no-node']) config.noNode = args['--no-node'];

if (args['--restart'])
  config.directives
    ? (config.directives.restart = args['--restart'])
    : (config.directives = { restart: args['--restart'] });

if (args['--terminate'])
  config.directives
    ? (config.directives.terminate = args['--terminate'])
    : (config.directives = { terminate: args['--terminate'] });

config.file = args._[0];
config.args = args._.slice(1);

const noder = new Noder({
  forever: config.forever,
  directives: config.directives,
});

if (config.noNode) {
  noder.start(config.file, ...config.args);
} else {
  noder.startNode(config.file, ...config.args);
}
