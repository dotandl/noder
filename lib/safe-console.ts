import { Directives } from '.';

class Terminator {
  constructor(
    private __directives: Directives,
    private __unsafeStdoutWrite: (...data: any) => void
  ) {}

  terminate() {
    this.__unsafeStdoutWrite(this.__directives.terminate);
  }

  restart() {
    this.__unsafeStdoutWrite(this.__directives.restart);
  }
}

export function enableSafeConsole(directives: Directives): Terminator {
  const unsafeStdoutWrite = process.stdout.write.bind(process.stdout);

  process.stdout.write = (str, encoding, cb?) => {
    if (typeof str === 'string') {
      for (const directive of Object.values(directives)) {
        str = str.replace(directive, '');
      }
    }

    return unsafeStdoutWrite(
      str,
      encoding as BufferEncoding,
      cb as (err?: Error) => void
    );
  };

  return new Terminator(directives, unsafeStdoutWrite);
}
