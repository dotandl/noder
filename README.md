# noder: node + restart

Simple node script that allows you to run scripts which are able to
self-restart, self-terminate and run forever.

## How does it work?

noder listens to special directives on stdout stream. When the script wants to
be restarted, it simply `console.log` a directive like `[noder:restart]`. Then
noder catches it and restarts the script. So simple, isn't it?

## Installation

```sh
# GLOBAL
$ npm i -g noder # using npm...
$ yarn global add noder # ...or yarn

# LOCAL
$ npm i -D noder
$ yarn add -D noder
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
})
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

## CLI

Usage: `noder [options] <script.js> [args]`

Options:

- `-h`, `--help` - Displays noder's help
- `-v`, `--version` - Displays noder's version
- `-f`, `--forever` - Enables forever mode (it means the script will restart after crash/exit; you can quit it by terminating)
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
- `noNode` - disable node (runs every program; the path to program must be provided in `file`)
- `directives` - list of directives
  - `restart` - restart directive
  - `terminate` - terminate directive
