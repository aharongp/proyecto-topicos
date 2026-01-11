import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  assertImageProvided,
  ensureFileSizeWithinLimit,
  getExtensionFromMime,
  normalizeFilename,
  parseFilter,
  parsePositiveNumber,
} from "../utils/validators";

export class FilterHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    assertImageProvided(file);
    ensureFileSizeWithinLimit(file);

    const filter = parseFilter(body.filter);
    let value: number | undefined;
    if (body.value !== undefined && body.value !== null && body.value !== "") {
      value = parsePositiveNumber(body.value, "value");
    }
    if (filter === "blur" && value === undefined) {
      value = 5;
    }

    const buffer = await this.imageService.applyFilter(file.buffer, { filter, value });
    const extension = getExtensionFromMime(file.mimetype);
    const filename = normalizeFilename(file.originalname, extension);

    return {
      buffer,
      contentType: file.mimetype,
      filename,
    };
  }
}
