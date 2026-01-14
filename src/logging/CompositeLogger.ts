import { LogEntry, ILogger } from "./ILogger";

export class CompositeLogger implements ILogger {
  constructor(private readonly loggers: ILogger[]) {}

  public async log(entry: LogEntry): Promise<void> {
    await Promise.all(this.loggers.map((logger) => logger.log(entry)));
  }
}

