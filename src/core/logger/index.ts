export class Logger {
  info(message: string, ...meta: any[]): void {
    console.log(message, ...meta);
  }

  error(message: string, ...meta: any[]): void {
    console.error(message, ...meta);
  }
}
