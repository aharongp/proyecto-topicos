import dotenv from "dotenv";
import express, { type Request, type Response, type NextFunction } from "express";
import { join } from "path";
import multer from "multer";
import { connectDatabase } from "./config/database";
import { UserModel } from "./models/User";
import { AuthService } from "./services/AuthService";
import { ImageService } from "./services/ImageService";
import { createAuthRouter } from "./routes/auth.routes";
import { createImageRouter } from "./routes/image.routes";
import { BadRequestError, EntityTooLargeError, UnauthorizedError, UnsupportedMediaError } from "./errors/AppError";
import { ILogger } from "./logging/ILogger";
import { CompositeLogger } from "./logging/CompositeLogger";
import { FileLogger } from "./logging/FileLogger";
import { MongoLogger } from "./logging/MongoLogger";
dotenv.config();

const PORT = Number(process.env.PORT ?? 3000);
const rawMongoUri = process.env.MONGO_URI;
const rawJwtSecret = process.env.JWT_SECRET;
const JWT_EXPIRATION = process.env.JWT_EXPIRATION ?? "1h";
const ENABLE_MONGO_LOGGER = process.env.LOG_TO_MONGO === "true";

if (!rawMongoUri) {
  throw new Error("MONGO_URI environment variable is required");
}

if (!rawJwtSecret) {
  throw new Error("JWT_SECRET environment variable is required");
}

const MONGO_URI = rawMongoUri;
const JWT_SECRET = rawJwtSecret;

async function bootstrap(): Promise<void> {
  await connectDatabase(MONGO_URI);

  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  const loggers: ILogger[] = [new FileLogger(join(process.cwd(), "logs", "app.log"))];
  if (ENABLE_MONGO_LOGGER) {
    loggers.push(new MongoLogger());
  }
  const logger = new CompositeLogger(loggers);

  const authService = new AuthService(UserModel, JWT_SECRET, JWT_EXPIRATION);
  const imageService = new ImageService();

  app.get("/health", (_req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/auth", createAuthRouter(authService));
  app.use("/images", createImageRouter(imageService, authService, logger));

  app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    
    if (err instanceof BadRequestError || err instanceof UnauthorizedError ) {
      res.status(err.statusCode).json({
        error: err.message,
        code: err.code,
        timestamp: new Date().toISOString(),
      });
      return;
    }


    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        const tooLarge = new EntityTooLargeError("File exceeds maximum size", "IMAGE_TOO_LARGE");
        res.status(tooLarge.statusCode).json({
          error: tooLarge.message,
          code: tooLarge.code,
          timestamp: new Date().toISOString(),
        });
        return;
      }

      const unsupported = new UnsupportedMediaError(err.message, "UPLOAD_ERROR");
      res.status(unsupported.statusCode).json({
        error: unsupported.message,
        code: unsupported.code,
        timestamp: new Date().toISOString(),
      });
      return;
    }

    const message = err instanceof Error ? err.message : "Internal Server Error";
    res.status(500).json({
      error: message,
      code: "INTERNAL_SERVER_ERROR",
      timestamp: new Date().toISOString(),
    });
  });

  app.listen(PORT, () => {
    console.log(`Image manipulation API listening on port ${PORT}`);
  });
}

void bootstrap();
