#!/usr/bin/env node
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
    if (config?.directives) this.__directives = config.directives;
    if (config?.forever) this.__forever = config.forever;
  }

  async start(path: string, ...args: string[]): Promise<void> {
    const proc = spawn(path, args, {
      stdio: [process.stdin, 'pipe', process.stderr],
    });

    proc.stdout.on('data', d => {
      d = d.toString();
      process.stdout.write(
        d
          .replace(this.__directives.restart, '')
          .replace(this.__directives.terminate, '')
      );

      if (d.includes(this.__directives.restart)) {
        console.log('RESTART');
      }

      if (d.includes(this.__directives.terminate)) {
        console.log('TERMINATE');
      }
    });
  }
}
