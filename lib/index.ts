import { spawn } from 'child_process';

interface Directives {
  restart?: string;
  terminate?: string;
}

export class Noder {
  private __directives: Directives = {
    restart: '[noder:restart]',
    terminate: '[noder:terminate]',
  };

  private __forever = false;

  constructor(config?: { directives?: Directives; forever?: boolean }) {
    if (config?.directives?.restart !== undefined)
      this.__directives.restart = config.directives.restart;
    if (config?.directives?.terminate !== undefined)
      this.__directives.terminate = config.directives.terminate;

    if (config?.forever !== undefined) this.__forever = config.forever;
  }

  private __log = (msg: string) => console.log(`\x1B[34mnoder: ${msg}\x1B[m`);

  async start(command: string, ...args: string[]): Promise<void> {
    this.__log(`${command} ${args.join(' ')}`);

    const proc = spawn(command, args, {
      stdio: [process.stdin, 'pipe', process.stderr],
    });

    let ignoreExit = false;

    proc.stdout.on('data', d => {
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
        this.start(command, ...args);
      }

      if (d.includes(this.__directives.terminate)) {
        this.__log('terminate requested; terminating...');
        ignoreExit = true;
        proc.kill('SIGTERM');
      }
    });

    proc.on('exit', (code, signal) => {
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

        this.start(command, ...args);
      } else {
        this.__log(
          `${
            code !== null ? `code: ${code}` : `signal: ${signal}`
          }; terminating...`
        );
      }
    });
  }

  startNode = (path: string, ...args: string[]): Promise<void> =>
    this.start(process.execPath, path, ...args);
}
