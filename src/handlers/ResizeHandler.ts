import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  ensureImageUploaded,
  verifySizeAllowed,
  getExtensionFromMime,
  normalizeFilename,
} from "../utils/validators";
import { parseResizeParams } from "../utils/parseparameters";

export class ResizeHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const buffer = await this.imageService.resize(file.buffer, parseResizeParams(body));
    const filename = normalizeFilename(file.originalname, getExtensionFromMime(file.mimetype));

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
