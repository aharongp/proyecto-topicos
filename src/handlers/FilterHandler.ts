import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  verifySizeAllowed,
  normalizeFilename,
  getExtensionFromMime,
  ensureImageUploaded,
} from "../utils/validators";
import { parseFilterParams } from "../utils/parseparameters";

export class FilterHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const buffer = await this.imageService.applyFilter(file.buffer, parseFilterParams(body));
    const filename = normalizeFilename(file.originalname, getExtensionFromMime(file.mimetype));

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
