import { spawn } from 'child_process';

export interface Directives {
  restart: string;
  terminate: string;
}

export class Noder {
  private __directives: Directives = {
    restart: '[noder:restart]',
    terminate: '[noder:terminate]',
  };

  private __forever = false;

  constructor(config?: { directives?: Directives; forever?: boolean }) {
    if (config?.directives !== undefined) this.__directives = config.directives;
    if (config?.forever !== undefined) this.__forever = config.forever;
  }

  private __log = (msg: string) => console.log(`\x1B[34mnoder: ${msg}\x1B[m`);

  async start(path: string, ...args: string[]): Promise<void> {
    this.__log(`${path} ${args.join(' ')}`);

    const proc = spawn(path, args, {
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
        proc.kill('SIGINT');
        this.start(path, ...args);
      }

      if (d.includes(this.__directives.terminate)) {
        this.__log('terminate requested; terminating...');
        ignoreExit = true;
        proc.kill('SIGINT');
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

        this.start(path, ...args);
      } else {
        this.__log(
          `${
            code !== null ? `code: ${code}` : `signal: ${signal}`
          }; terminating...`
        );
      }
    });
  }
}
