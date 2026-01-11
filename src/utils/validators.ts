import { BadRequestError } from "../errors/AppError";
import { AjusteImagen, TipoFiltroImagen } from "../types";

const FORMATOS_PERMITIDOS = new Map<string, string>([
  ["jpeg", "jpeg"],
  ["jpg", "jpeg"],
  ["png", "png"],
  ["webp", "webp"],
]);

const MIMES_PERMITIDOS = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/tiff",
]);

export function obtenerTamanoMaximoArchivo(): number {
  const defecto = 10 * 1024 * 1024;
  const crudo = process.env.MAX_FILE_SIZE_BYTES;
  if (!crudo) {
    return defecto;
  }
  const convertido = Number(crudo);
  if (!Number.isFinite(convertido) || convertido <= 0) {
    throw new BadRequestError("MAX_FILE_SIZE_BYTES debe ser un número positivo", "INVALID_CONFIGURATION");
  }
  return convertido;
}

export function asegurarImagenCargada(archivo?: Express.Multer.File): asserts archivo {
  if (!archivo) {
    throw new BadRequestError("El archivo de imagen es obligatorio", "IMAGE_REQUIRED");
  }
}

export function validarTipoMime(mime: string): void {
  if (!MIMES_PERMITIDOS.has(mime)) {
    throw new BadRequestError("Tipo MIME de imagen no soportado", "INVALID_MIME_TYPE");
  }
}

export function parsearEnteroPositivo(valor: unknown, nombre: string): number {
  const convertido = Number(valor);
  if (!Number.isInteger(convertido) || convertido <= 0) {
    throw new BadRequestError(`${nombre} debe ser un entero positivo`, "INVALID_PARAMETER");
  }
  return convertido;
}

export function parsearEnteroNoNegativo(valor: unknown, nombre: string): number {
  const convertido = Number(valor);
  if (!Number.isInteger(convertido) || convertido < 0) {
    throw new BadRequestError(`${nombre} debe ser un entero no negativo`, "INVALID_PARAMETER");
  }
  return convertido;
}

export function parsearEnteroPositivoOpcional(valor: unknown, nombre: string): number | undefined {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }
  return parsearEnteroPositivo(valor, nombre);
}

export function parsearAjuste(valor: unknown): AjusteImagen | undefined {
  if (!valor) {
    return undefined;
  }
  const ajuste = String(valor);
  const permitidos: AjusteImagen[] = ["cover", "contain", "fill", "inside", "outside"];
  if (!permitidos.includes(ajuste as AjusteImagen)) {
    throw new BadRequestError("Ajuste inválido", "INVALID_PARAMETER");
  }
  return ajuste as AjusteImagen;
}

export function parsearAngulo(valor: unknown): number {
  const angulo = Number(valor);
  const permitidos = new Set([0, 90, 180, 270, 360]);
  if (!permitidos.has(angulo)) {
    throw new BadRequestError("El ángulo debe ser 0, 90, 180, 270 o 360", "INVALID_PARAMETER");
  }
  return angulo;
}

export function parsearFormato(valor: unknown): string {
  const formato = String(valor ?? "").toLowerCase();
  const normalizado = FORMATOS_PERMITIDOS.get(formato);
  if (!normalizado) {
    throw new BadRequestError("Formato de salida no soportado", "INVALID_FORMAT");
  }
  return normalizado;
}

export function parsearFiltro(valor: unknown): TipoFiltroImagen {
  const filtro = String(valor ?? "").toLowerCase() as TipoFiltroImagen;
  const permitidos: TipoFiltroImagen[] = ["blur", "sharpen", "grayscale"];
  if (!permitidos.includes(filtro)) {
    throw new BadRequestError("Tipo de filtro no soportado", "INVALID_FILTER");
  }
  return filtro;
}

export function parsearNumeroPositivo(valor: unknown, nombre: string): number {
  const convertido = Number(valor);
  if (!Number.isFinite(convertido) || convertido <= 0) {
    throw new BadRequestError(`${nombre} debe ser un número positivo`, "INVALID_PARAMETER");
  }
  return convertido;
}

export function obtenerExtensionDesdeMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return "jpeg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/avif":
      return "avif";
    case "image/tiff":
      return "tiff";
    default:
      throw new BadRequestError("Tipo MIME no soportado", "INVALID_MIME_TYPE");
  }
}

export function sanearParametros(parametros: Record<string, unknown>): Record<string, unknown> {
  const copia: Record<string, unknown> = {};
  for (const [clave, valor] of Object.entries(parametros)) {
    if (valor instanceof Buffer) {
      copia[clave] = `[buffer:${valor.length}]`;
    } else if (Array.isArray(valor)) {
      copia[clave] = valor.map((elemento) => (elemento instanceof Buffer ? "[buffer]" : elemento));
    } else {
      copia[clave] = valor;
    }
  }
  return copia;
}

export function verificarTamanoPermitido(archivo: Express.Multer.File): void {
  if (archivo.size > obtenerTamanoMaximoArchivo()) {
    throw new BadRequestError("La imagen supera el tamaño permitido", "IMAGE_TOO_LARGE");
  }
}

export function normalizarNombreArchivo(nombreOriginal: string, extension: string): string {
  const base = nombreOriginal?.split(".").slice(0, -1).join(".") || "imagen-procesada";
  return `${base}.${extension}`;
}
