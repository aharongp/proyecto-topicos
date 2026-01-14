import type { Request } from "express";

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface UserRequest {
  email: string;
}

export interface ImageHandlerResult {
  buffer: Buffer;
  contentType: string;
  filename: string;
}

export interface ImageHandlerContext {
  request: Request;
  file?: Express.Multer.File;
  endpoint: string;
  body: Record<string, unknown>;
  query: Record<string, unknown>;
}

declare module "express-serve-static-core" {
  interface Request {
    user?: UserRequest;
  }
}

export const ALLOWED_FITS = ["cover", "contain", "fill", "inside", "outside"] as const;
export type ImageFit = typeof ALLOWED_FITS[number];

export const ALLOWED_FILTERS = ["blur", "sharpen", "grayscale"] as const;
export type ImageFilterType = typeof ALLOWED_FILTERS[number];

export const ALLOWED_FORMATS = new Set<string>(["jpeg", "png", "webp"]);

export const ALLOWED_ANGLES = new Set<number>([0, 90, 180, 270, 360]);

export interface PipelineOperation {
  type: string;
  parameters: Record<string, unknown>;
}

export const ALLOWED_MIMES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

export interface ResizeParameters {
  width?: number;
  height?: number;
  fit?: ImageFit;
}

export interface CropParameters {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface FormatParameters {
  format: string;
}

export interface RotationParameters {
  angle: number;
}

export interface FilterParameters {
  filter: ImageFilterType;
  value?: number;
}

export interface JwtPayload {
  sub: string;
  email: string;
  iat: number;
  exp: number;
}

