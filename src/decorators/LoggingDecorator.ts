import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "../handlers/IImageHandler";
import type { ILogger } from "../logging/ILogger";
import { sanitizeParameters } from "../utils/validators";

export class LoggingDecorator implements IImageHandler {
  constructor(private readonly interno: IImageHandler, private readonly logger: ILogger) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const start = Date.now();
    try {
      const result = await this.interno.handle(context);
      await this.logger.log({
        timestamp: new Date().toISOString(),
        level: "info",
        user: context.request.user?.email,
        endpoint: context.endpoint,
        parameters: sanitizeParameters(context.body),
        duration: Date.now() - start,
        result: "success",
      });
      return result;
    } catch (error) {
      await this.logger.log({
        timestamp: new Date().toISOString(),
        level: "error",
        user: context.request.user?.email,
        endpoint: context.endpoint,
        parameters: sanitizeParameters(context.body),
        duration: Date.now() - start,
        result: "error",
        message: (error as Error).message,
      });
      throw error;
    }
  }
}

