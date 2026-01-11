import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  assertImageProvided,
  ensureFileSizeWithinLimit,
  getExtensionFromMime,
  normalizeFilename,
  parseAngle,
} from "../utils/validators";

export class RotateHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    assertImageProvided(file);
    ensureFileSizeWithinLimit(file);

    const angle = parseAngle(body.angle);
    const buffer = await this.imageService.rotate(file.buffer, { angle });
    const extension = getExtensionFromMime(file.mimetype);
    const filename = normalizeFilename(file.originalname, extension);

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
