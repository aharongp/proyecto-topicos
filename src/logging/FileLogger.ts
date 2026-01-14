import { promises as fs } from "fs";
import { dirname } from "path";
import { LogEntry, ILogger } from "./ILogger";

export class FileLogger implements ILogger {
  constructor(private readonly filePath: string) {}

  public async log(entry: LogEntry): Promise<void> {
    const serialized = JSON.stringify(entry);
    await fs.mkdir(dirname(this.filePath), { recursive: true });
    await fs.appendFile(this.filePath, `${serialized}\n`, { encoding: "utf-8" });
  }
}
