import { connection } from "mongoose";
import { LogEntry, ILogger } from "./ILogger";

export class MongoLogger implements ILogger {
  constructor(private readonly collectionName = "logs") {}

  public async log(entry: LogEntry): Promise<void> {
    if (connection.readyState !== 1) {
      return;
    }

    await connection.collection(this.collectionName).insertOne(entry);
  }
}
