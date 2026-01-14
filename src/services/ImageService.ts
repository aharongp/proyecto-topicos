import sharp from "sharp";
import { BadRequestError } from "../errors/AppError";
import type { PipelineOperation, FilterParameters, FormatParameters, CropParameters, ResizeParameters, RotationParameters } from "../types";

export class ImageService {
  public async resize(buffer: Buffer, parameters: ResizeParameters): Promise<Buffer> {
    const stream = sharp(buffer);
    stream.resize({
      width: parameters.width,
      height: parameters.height,
      fit: parameters.fit,
    });
    return stream.toBuffer();
  }

  public async crop(buffer: Buffer, parameters: CropParameters): Promise<Buffer> {
    return sharp(buffer)
      .extract({
        left: parameters.left,
        top: parameters.top,
        width: parameters.width,
        height: parameters.height,
      })
      .toBuffer();
  }

  public async convertFormat(buffer: Buffer, parameters: FormatParameters): Promise<{ buffer: Buffer; contentType: string }> {
    const stream = sharp(buffer);
    switch (parameters.format) {
      case "jpeg":
        stream.jpeg();
        break;
      case "png":
        stream.png();
        break;
      case "webp":
        stream.webp();
        break;
      default:
        throw new BadRequestError("Unsupported output format", "INVALID_FORMAT");
    }
    const converted = await stream.toBuffer();
    const contentType = `image/${parameters.format}`;
    return { buffer: converted, contentType };
  }

  public async rotate(buffer: Buffer, parameters: RotationParameters): Promise<Buffer> {
    return sharp(buffer).rotate(parameters.angle).toBuffer();
  }

  public async applyFilter(buffer: Buffer, parameters: FilterParameters): Promise<Buffer> {
    const stream = sharp(buffer);
    switch (parameters.filter) {
      case "blur":
        stream.blur(parameters.value);
        break;
      case "sharpen":
        stream.sharpen();
        break;
      case "grayscale":
        stream.grayscale();
        break;
      default:
        throw new BadRequestError("Unsupported filter requested", "INVALID_FILTER");
    }
    return stream.toBuffer();
  }

  public async processPipeline(
    buffer: Buffer,
    operations: PipelineOperation[],
    initialContentType: string
  ): Promise<{ buffer: Buffer; contentType: string }> {
    let workingBuffer = buffer;
    let currentContentType = initialContentType;

    for (const operation of operations) {
      switch (operation.type) {
        case "resize": {
         const params = operation.parameters as unknown as ResizeParameters;
          workingBuffer = await this.resize(workingBuffer, {
            width: params.width,
            height: params.height,
            fit: params.fit,
          });
          break;
        }
        case "format": {
          const params = operation.parameters as unknown as FormatParameters;
          const result = await this.convertFormat(workingBuffer, { format: params.format });
          workingBuffer = result.buffer;
          currentContentType = result.contentType;
          break;
        }
        case "rotate": {
          const params = operation.parameters as unknown as RotationParameters;
          workingBuffer = await this.rotate(workingBuffer, { angle: params.angle });
          break;
        }
        case "filter": {
          const params = operation.parameters as unknown as FilterParameters;
          workingBuffer = await this.applyFilter(workingBuffer, {
            filter: params.filter,
            value: params.value,
          });
          break;
        }
        default:
          throw new BadRequestError(`Unsupported operation in pipeline: ${operation.type}`, "INVALID_OPERATION");
      }
    }

    return { buffer: workingBuffer, contentType: currentContentType };
  }

}