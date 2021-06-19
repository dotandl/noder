# noder: node + restart

Simple node script that allows you to run scripts which are able to
self-restart, self-terminate and run forever.

[![NPM](https://nodei.co/npm/noder-restart.png)](https://nodejs.com/package/noder-restart)

## How does it work?

noder listens to special directives on stdout stream. When the script wants to
be restarted, it simply `console.log` a directive like `[noder:restart]`. Then
noder catches it and restarts the script. So simple, isn't it?

## Installation

```sh
# GLOBAL
$ npm i -g noder-restart # using npm...
$ yarn global add noder-restart # ...or yarn

# LOCAL
$ npm i -D noder-restart
$ yarn add -D noder-restart
```

## Usage

Save this script as `script.js`:

```js
console.log('Hello World!');

setTimeout(() => {
  console.log('Restarting...');
  console.log('[noder:restart]'); // [noder:restart] will be caught by noder and will cause the script to restart

  // You can write everything in one line as well:
  // console.log('Restarting... [noder:restart]');
}, 1000);
```

Then run it using noder:

```sh
$ noder script.js
```

Or, if you installed noder locally:

```sh
$ npx noder script.js
$ yarn noder script.js
```

The script will be restarted every second.

---

`console.log('[noder:restart]');` - restarts script  
`console.log('[noder:terminate]');` - terminates script

## Safe console

You can enable safe console mode in the script run by noder. This mode prevents
terminate/restart by accident by removing the directives from the stream while
using `console.log`.

Here's how to enable safe console:

```js
const { enableSafeConsole } = require('noder-restart');

// Enable safe console mode
// Note: if you configure noder to use custom terminate/restart directive
// you will need to change the directives below. Otherwise leave everything as is.
const terminator = enableSafeConsole({
  restart: '[noder:restart]',
  terminate: '[noder:terminate]'
});

// Now if you type:
console.log('[noder:restart]');
console.log('[noder:terminate]');
// nothing happens!

// Use terminator object to restart script
terminator.restart();

// In case you want to terminate your script, write:
// terminator.terminate();
```

## CLI

Usage: `noder [options] <script> [script args]`

Options:

- `-h`, `--help` - Displays noder's help
- `-v`, `--version` - Displays noder's version
- `-f`, `--forever` - Enables forever mode (it means the script will restart after crash/exit; you can quit it by terminating)
- `-w`, `--watch` - Defines glob patterns for watch mode
- `-N`, `--no-node` - Disables node script execution mode (you can execute every script/program)
- `-c`, `--config` - Loads custom config file (the default one is `/current/woring/dir/noder.json` **if exists**)
- `--restart` - Defines custom restart directive
- `--terminate` - Defines custom terminate directive

## Config

By default noder searches for the config file named `noder.json` placed in the
current working directory (you can change it using `-c/--config` option).

Content:

```json
{
  "file": "script.js",
  "args": ["arg1", "arg2"],
  "forever": false,
  "watch": ["*.js", "*.ts"],
  "noNode": false,
  "directives": {
    "restart": "[noder:restart]",
    "terminate": "[noder:terminate]"
  }
}
```

- `file` - node script to execute (or the program name/path if `noNode` is `true`)
- `args` - CLI arguments for script/program
- `forever` - forever mode (auto-restart after exit/crash)
- `watch` - array with glob patterns for watch mode
- `noNode` - disable node (runs every program; the path to program must be provided in `file`)
- `directives` - list of directives
  - `restart` - restart directive
  - `terminate` - terminate directive
