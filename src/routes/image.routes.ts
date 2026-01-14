import { Router } from "express";
import type { RequestHandler } from "express";
import { uploadSingleImage } from "../middleware/upload";
import { IImageHandler  } from "../handlers/IImageHandler";
import { AuthService } from "../services/AuthService";
import { LoggingDecorator } from "../decorators/LoggingDecorator";
import { DecoratorAuthentication } from "../decorators/AuthDecorator";
import { ILogger } from "../logging/ILogger";
import { ImageService } from "../services/ImageService";
import { CropHandler } from "../handlers/CropHandler";
import { RotateHandler } from "../handlers/RotateHandler";
import { ResizeHandler } from "../handlers/ResizeHandler";
import { FormatHandler } from "../handlers/FormatHandler";
import { PipelineHandler } from "../handlers/PipelineHandler";
import { FilterHandler } from "../handlers/FilterHandler";

function createEndpointHandler(handler: IImageHandler, endpoint: string): RequestHandler {
  return async (req, res, next) => {
    try {
      const result = await handler.handle({
        request: req,
        file: req.file,
        endpoint,
        body: req.body,
        query: req.query,
      });

      res.setHeader("Content-Type", result.contentType);
      res.setHeader("Content-Disposition", `attachment; filename="${result.filename}"`);
      res.status(200).send(result.buffer);
    } catch (error) {
      next(error);
    }
  };
}

function decorateHandler(core: IImageHandler, authService: AuthService, logger: ILogger): IImageHandler {
  return new LoggingDecorator(new DecoratorAuthentication(core, authService), logger);
}

export function createImageRouter(
  imageService: ImageService,
  authService: AuthService,
  logger: ILogger
): Router {
  const router = Router();

  const resizeHandler = decorateHandler(new ResizeHandler(imageService), authService, logger);
  const cropHandler = decorateHandler(new CropHandler(imageService), authService, logger);
  const formatHandler = decorateHandler(new FormatHandler(imageService), authService, logger);
  const rotateHandler = decorateHandler(new RotateHandler(imageService), authService, logger);
  const filterHandler = decorateHandler(new FilterHandler(imageService), authService, logger);
  const pipelineHandler = decorateHandler(new PipelineHandler(imageService), authService, logger);

  router.post("/resize", uploadSingleImage, createEndpointHandler(resizeHandler, "/images/resize"));
  router.post("/crop", uploadSingleImage, createEndpointHandler(cropHandler, "/images/crop"));
  router.post("/format", uploadSingleImage, createEndpointHandler(formatHandler, "/images/format"));
  router.post("/rotate", uploadSingleImage, createEndpointHandler(rotateHandler, "/images/rotate"));
  router.post("/filter", uploadSingleImage, createEndpointHandler(filterHandler, "/images/filter"));
  router.post("/pipeline", uploadSingleImage, createEndpointHandler(pipelineHandler, "/images/pipeline"));

  return router;
}
