import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  ensureImageUploaded,
  getExtensionFromMime,
  normalizeFilename,
  parseFormat,
  verifySizeAllowed,
} from "../utils/validators";

export class FormatHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const format = parseFormat(body.format);
    const { buffer, contentType } = await this.imageService.convertFormat(file.buffer, { format });
    const filename = normalizeFilename(file.originalname, getExtensionFromMime(contentType));

    return {
      buffer,
      contentType,
      filename,
    };
  }
}
