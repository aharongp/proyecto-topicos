import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  ensureImageUploaded,
  verifySizeAllowed,
  getExtensionFromMime,
  normalizeFilename,
} from "../utils/validators";
import { parseCropParams } from "../utils/parseparameters";

export class CropHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const buffer = await this.imageService.crop(file.buffer, parseCropParams(body));

    const filename = normalizeFilename(file.originalname, getExtensionFromMime(file.mimetype));

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
