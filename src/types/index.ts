import type { Request } from "express";

export interface RespuestaApi<T> {
  exito: boolean;
  datos?: T;
  error?: string;
  fecha: string;
}

export interface CargaTokenAutenticacion {
  sub: string;
  correo: string;
  iat: number;
  exp: number;
}

export interface UsuarioSolicitud {
  id: string;
  correo: string;
}

export interface ResultadoManejadorImagen {
  buffer: Buffer;
  tipoContenido: string;
  nombreArchivo: string;
}

export interface ContextoManejadorImagen {
  solicitud: Request;
  archivo?: Express.Multer.File;
  endpoint: string;
  cuerpo: Record<string, unknown>;
  consulta: Record<string, unknown>;
}

declare module "express-serve-static-core" {
  interface Request {
    usuario?: UsuarioSolicitud;
  }
}

export type AjusteImagen = "cover" | "contain" | "fill" | "inside" | "outside";

export type TipoFiltroImagen = "blur" | "sharpen" | "grayscale";

export interface OperacionCanal {
  tipo: string;
  parametros?: Record<string, unknown>;
}
