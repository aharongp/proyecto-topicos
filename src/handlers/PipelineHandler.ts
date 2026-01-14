import { BadRequestError } from "../errors/AppError";
import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, PipelineOperation, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  parseOperations,
  normalizeFilename,
  getExtensionFromMime,
  ensureImageUploaded,
  verifySizeAllowed,
} from "../utils/validators";
import { parseFilterParams, parseFormatParams, parseCropParams, parseResizeParams, parseRotationParams } from "../utils/parseparameters";


export class PipelineHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    ensureImageUploaded(file);
    verifySizeAllowed(file);

    const operations = parseOperations(body.operations);


    const operationsValidated = operations.map((operation) => {
      switch (operation.type) {
        case "resize": {
          return {
            type: "resize",
            parameters: parseResizeParams(operation.parameters),
          };
        }
        case "crop":
          return {
            type: "crop",
            parameters: parseCropParams(operation.parameters),
          };
        case "format": {
          return {
            type: "format",
            parameters: parseFormatParams(operation.parameters),
          };
        }
        case "rotate":
          return {
            type: "rotate",
            parameters: parseRotationParams(operation.parameters),
          };
        case "filter": {
          return {
            type: "filter",
            parameters: parseFilterParams(operation.parameters),
          };
        }
        default:
          throw new BadRequestError(`Operación no compatible: ${operation.type}`, "INVALID_PIPELINE_OPERATION");
      }
    });

    const { buffer, contentType } = await this.imageService.processPipeline(
      file.buffer,
      operationsValidated as PipelineOperation[],
      file.mimetype
    );

    const filename = normalizeFilename(file.originalname, getExtensionFromMime(file.mimetype));

    return {
      buffer,
      contentType,
      filename,
    };
  }

}
