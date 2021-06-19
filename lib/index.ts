import { spawn } from 'child_process';
import chokidar from 'chokidar';

export interface Directives {
  restart?: string;
  terminate?: string;
}

interface Config {
  directives?: Directives;
  forever?: boolean;
  watch?: string[];
}

export class Noder {
  private __directives: Directives = {
    restart: '[noder:restart]',
    terminate: '[noder:terminate]',
  };

  private __forever = false;
  private __watch: string[] = [];

  constructor(config?: Config) {
    if (config?.directives?.restart)
      this.__directives.restart = config.directives.restart;
    if (config?.directives?.terminate)
      this.__directives.terminate = config.directives.terminate;

    if (typeof config?.forever !== 'undefined') this.__forever = config.forever;
    if (config?.watch?.length) this.__watch = config.watch;
  }

  private __log = (msg: string) => console.log(`\x1B[34mnoder: ${msg}\x1B[m`);

  async start(command: string, ...args: string[]): Promise<void> {
    this.__log(`${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: [process.stdin, 'pipe', process.stderr],
    });

    let ignoreExit = false;
    let watcher: chokidar.FSWatcher;

    if (this.__watch) {
      watcher = chokidar.watch(this.__watch, { ignoreInitial: true });

      const cb = async () => {
        this.__log('one of the watched files has been changed; restarting...');
        ignoreExit = true;
        proc.kill('SIGTERM');
        await watcher.close();
        this.start(command, ...args);
      };

      watcher.on('add', cb);
      watcher.on('unlink', cb);
      watcher.on('change', cb);
    }

    proc.stdout.on('data', async d => {
      d = d.toString();
      process.stdout.write(
        d
          .replace(this.__directives.restart, '')
          .replace(this.__directives.terminate, '')
      );

      if (d.includes(this.__directives.restart)) {
        this.__log('restart requested; restarting...');
        ignoreExit = true;
        proc.kill('SIGTERM');
        if (watcher) await watcher.close();
        this.start(command, ...args);
      }

      if (d.includes(this.__directives.terminate)) {
        this.__log('terminate requested; terminating...');
        ignoreExit = true;
        proc.kill('SIGTERM');
        if (watcher) await watcher.close();
      }
    });

    proc.on('exit', async (code, signal) => {
      if (ignoreExit) {
        ignoreExit = false;
        return;
      }

      if (this.__forever) {
        this.__log(
          `${
            code !== null ? `code: ${code}` : `signal: ${signal}`
          }; restarting due to forever mode...`
        );

        if (watcher) await watcher.close();
        this.start(command, ...args);
      } else {
        this.__log(
          `${
            code !== null ? `code: ${code}` : `signal: ${signal}`
          }; terminating...`
        );

        if (watcher) await watcher.close();
      }
    });
  }

  startNode = (path: string, ...args: string[]): Promise<void> =>
    this.start(process.execPath, path, ...args);
}
