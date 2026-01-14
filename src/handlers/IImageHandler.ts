import type { ImageHandlerContext, ImageHandlerResult } from "../types";

export interface IImageHandler {
  handle(context: ImageHandlerContext): Promise<ImageHandlerResult>;
}
