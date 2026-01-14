import multer from "multer";
import type { Request } from "express";
import { getMaxFileSize, validateMimeType } from "../utils/validators";

const storage = multer.memoryStorage();

const upload = multer({
  storage: storage,
  limits: { fileSize: getMaxFileSize() },
  fileFilter: (_req: Request, file, callback) => {
    try {
      validateMimeType(file.mimetype);
      callback(null, true);
    } catch (error) {
      callback(error as Error);
    }
  },
});

export const uploadSingleImage = upload.single("image");
