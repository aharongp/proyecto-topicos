import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  ensureImageUploaded,
  verifySizeAllowed,
  getExtensionFromMime,
  normalizeFilename,
} from "../utils/validators";
import { parseRotationParams } from "../utils/parseparameters";

export class RotateHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const buffer = await this.imageService.rotate(file.buffer, parseRotationParams(body));
    const filename = normalizeFilename(file.originalname, getExtensionFromMime(file.mimetype));

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
