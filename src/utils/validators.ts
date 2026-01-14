import { BadRequestError } from "../errors/AppError";
import { ImageFit, ImageFilterType, ALLOWED_FORMATS, ALLOWED_MIMES, ALLOWED_FITS, ALLOWED_FILTERS, ALLOWED_ANGLES, PipelineOperation } from "../types";



export function parsePositiveNumber(value: unknown, name: string): number {
  const converted = Number(value);
  if (!Number.isFinite(converted) || converted <= 0) {
    throw new BadRequestError(`${name} must be a positive number`, "INVALID_PARAMETER");
  }
  return converted;
}

export function parsePositiveInteger(value: unknown, name: string): number {
  const converted = Number(value);
  if (!Number.isInteger(converted) || converted <= 0) {
    throw new BadRequestError(`${name} must be a positive integer`, "INVALID_PARAMETER");
  }
  return converted;
}

export function parseNonNegativeInteger(value: unknown, name: string): number {
  const converted = Number(value);
  if (!Number.isInteger(converted) || converted < 0) {
    throw new BadRequestError(`${name} must be a non-negative integer`, "INVALID_PARAMETER");
  }
  return converted;
}

export function parseOptionalPositiveInteger(value: unknown, name: string): number | undefined {
  if (value === undefined || value === null || value === "") {
    return undefined;
  }
  return parsePositiveInteger(value, name);
}

export function getMaxFileSize(): number {
  const defaultValue = 10 * 1024 * 1024; //10MB
  const raw = process.env.MAX_FILE_SIZE_BYTES;
  if (!raw) {
    return defaultValue;
  }
  return parsePositiveNumber(raw, "MAX_FILE_SIZE_BYTES");
}

export function ensureImageUploaded(file?: Express.Multer.File): asserts file {
  if (!file) {
    throw new BadRequestError("Image file is required", "IMAGE_REQUIRED");
  }
}

export function validateMimeType(mime: string): void {
  if (!ALLOWED_MIMES.has(mime)) {
    throw new BadRequestError("Unsupported image MIME type", "INVALID_MIME_TYPE");
  }
}

export function getExtensionFromMime(mime: string): string {
  if (ALLOWED_MIMES.has(mime)) {
    return mime.split("/")[1];
  }
  throw new BadRequestError("Unsupported MIME type", "INVALID_MIME_TYPE");
}

export function verifySizeAllowed(file: Express.Multer.File): void {
  if (file.size > getMaxFileSize()) {
    throw new BadRequestError("Image exceeds allowed size", "IMAGE_TOO_LARGE");
  }
}

export function normalizeFilename(originalName: string, extension: string): string {
  if (!originalName || originalName.trim() === "") {
    return `processed-file.${extension}`;
  }

  const parts = originalName.split(".");
  const base = parts.length > 1
    ? parts.slice(0, -1).join(".")
    : originalName;

  let cleanBase = base
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9.-]/g, "");

  cleanBase ??= "processed-file";

  return `${cleanBase}.${extension}`;
}

export function parseFit(value: unknown): ImageFit {
  if (!value) {
    return "cover";
  }
  const fit: ImageFit = String(value) as ImageFit;
  if (!ALLOWED_FITS.includes(fit)) {
    throw new BadRequestError("Invalid fit", "INVALID_ADJUSTMENT");
  }
  return fit;
}

export function parseAngle(value: unknown): number {
  const angle: number = Number(value);
  if (!ALLOWED_ANGLES.has(angle)) {
    throw new BadRequestError("Angle must be 0, 90, 180, 270 or 360", "INVALID_PARAMETER");
  }
  return angle;
}

export function parseFormat(value: unknown): string {
  const format = String(value ?? "").toLowerCase();
  if (!ALLOWED_FORMATS.has(format)) {
    throw new BadRequestError("Unsupported output format", "INVALID_FORMAT");
  }
  return format;
}

export function parseFilter(value: unknown): ImageFilterType {
  const filter = String(value ?? "").toLowerCase();
  if (!ALLOWED_FILTERS.includes(filter as ImageFilterType)) {
    throw new BadRequestError("Unsupported filter type", "INVALID_FILTER");
  }
  return filter as ImageFilterType;
}

export function sanitizeParameters(parameters: Record<string, unknown>): Record<string, unknown> {
  const copy: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parameters)) {
    if (value instanceof Buffer) {
      copy[key] = `[buffer:${value.length}]`;
    } else if (Array.isArray(value)) {
      copy[key] = value.map((element) => (element instanceof Buffer ? "[buffer]" : element));
    } else {
      copy[key] = value;
    }
  }
  return copy;
}

export function parseOperations(input: unknown): PipelineOperation[] {
  let operations = input;
  let attempts = 0;

  while (typeof operations === "string" && attempts < 2) {
    try {
      operations = JSON.parse(operations);
      attempts++;
    } catch (error) {
      throw new BadRequestError("Invalid JSON format", "INVALID_PIPELINE_FORMAT");
    }
  }

  if (!Array.isArray(operations)) {
    throw new BadRequestError("Operations must be a non-empty array", "INVALID_PIPELINE_FORMAT");
  }

  if (operations.length === 0) {
    throw new BadRequestError("Operations must be a non-empty array", "INVALID_PIPELINE_FORMAT");
  }

  return operations as PipelineOperation[];
}
