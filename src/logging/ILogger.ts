export type LogLevel = "info" | "error";

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  user?: string;
  endpoint: string;
  parameters: Record<string, unknown>;
  duration: number;
  result: "success" | "error";
  message?: string;
}

export interface ILogger {
  log(entry: LogEntry): Promise<void>;
}

