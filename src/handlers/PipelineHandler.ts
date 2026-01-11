import { BadRequestError } from "../errors/AppError";
import { ImageService } from "../services/ImageService";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { IImageHandler } from "./IImageHandler";
import {
  assertImageProvided,
  ensureFileSizeWithinLimit,
  normalizeFilename,
  parseAngle,
  parseFilter,
  parseFormat,
  parseFit,
  parseNonNegativeInt,
  parseOptionalPositiveInt,
  parsePositiveInt,
  parsePositiveNumber,
} from "../utils/validators";

interface OperationInput {
  type: unknown;
  params?: Record<string, unknown>;
}

export class PipelineHandler implements IImageHandler {
  constructor(private readonly imageService: ImageService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const { file, body } = context;
    assertImageProvided(file);
    ensureFileSizeWithinLimit(file);

    const rawOperations = this.parseOperationsInput(body.operations);
    if (rawOperations.length === 0) {
      throw new BadRequestError("Pipeline requires at least one operation", "INVALID_PIPELINE");
    }

    const validatedOperations = rawOperations.map((operation) => {
      const type = String(operation.type);
      const params = operation.params ?? {};
      switch (type) {
        case "resize": {
          const width = parseOptionalPositiveInt(params.width, "width");
          const height = parseOptionalPositiveInt(params.height, "height");
          if (!width && !height) {
            throw new BadRequestError(
              "Resize operation requires width or height",
              "INVALID_PIPELINE_OPERATION"
            );
          }
          return {
            type,
            params: {
              width,
              height,
              fit: parseFit(params.fit),
            },
          };
        }
        case "crop":
          return {
            type,
            params: {
              left: parseNonNegativeInt(params.left, "left"),
              top: parseNonNegativeInt(params.top, "top"),
              width: parsePositiveInt(params.width, "width"),
              height: parsePositiveInt(params.height, "height"),
            },
          };
        case "format":
          return {
            type,
            params: {
              format: parseFormat(params.format),
            },
          };
        case "rotate":
          return {
            type,
            params: {
              angle: parseAngle(params.angle),
            },
          };
        case "filter": {
          const filter = parseFilter(params.filter);
          let value: number | undefined;
          if (params.value !== undefined) {
            value = parsePositiveNumber(params.value, "value");
          }
          return {
            type,
            params: {
              filter,
              value,
            },
          };
        }
        default:
          throw new BadRequestError(`Unsupported operation type: ${type}`, "INVALID_PIPELINE_OPERATION");
      }
    });

    const { buffer, contentType } = await this.imageService.applyPipeline(
      file.buffer,
      validatedOperations,
      file.mimetype
    );

    const extension = contentType.split("/").pop() ?? "jpeg";
    const filename = normalizeFilename(file.originalname, extension);

    return {
      buffer,
      contentType,
      filename,
    };
  }

  private parseOperationsInput(input: unknown): OperationInput[] {
    if (typeof input === "string") {
      try {
        const parsed = JSON.parse(input) as unknown;
        return this.parseOperationsInput(parsed);
      } catch (error) {
        throw new BadRequestError(
          `Invalid JSON in operations: ${(error as Error).message}`,
          "INVALID_PIPELINE_FORMAT"
        );
      }
    }

    if (!Array.isArray(input)) {
      throw new BadRequestError("Operations must be an array", "INVALID_PIPELINE_FORMAT");
    }

    return input as OperationInput[];
  }
}
