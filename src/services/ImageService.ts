import sharp, { FitEnum } from "sharp";
import { BadRequestError } from "../errors/AppError";
import type { AjusteImagen, OperacionCanal, TipoFiltroImagen } from "../types";

export interface ParametrosRedimension {
  ancho?: number;
  alto?: number;
  ajuste?: AjusteImagen;
}

export interface ParametrosRecorte {
  izquierda: number;
  arriba: number;
  ancho: number;
  alto: number;
}

export interface ParametrosFormato {
  formato: string;
}

export interface ParametrosRotacion {
  angulo: number;
}

export interface ParametrosFiltro {
  filtro: TipoFiltroImagen;
  valor?: number;
}

export class ServicioImagenes {
  public async redimensionar(buffer: Buffer, parametros: ParametrosRedimension): Promise<Buffer> {
    const flujo = sharp(buffer);
    flujo.resize({
      width: parametros.ancho,
      height: parametros.alto,
      fit: (parametros.ajuste ?? "cover") as keyof FitEnum,
    });
    return flujo.toBuffer();
  }

  public async recortar(buffer: Buffer, parametros: ParametrosRecorte): Promise<Buffer> {
    return sharp(buffer)
      .extract({
        left: parametros.izquierda,
        top: parametros.arriba,
        width: parametros.ancho,
        height: parametros.alto,
      })
      .toBuffer();
  }

  public async convertirFormato(buffer: Buffer, parametros: ParametrosFormato): Promise<{ buffer: Buffer; tipoContenido: string }> {
    const flujo = sharp(buffer);
    switch (parametros.formato) {
      case "jpeg":
        flujo.jpeg();
        break;
      case "png":
        flujo.png();
        break;
      case "webp":
        flujo.webp();
        break;
      default:
        throw new BadRequestError("Formato de salida no soportado", "INVALID_FORMAT");
    }
    const convertido = await flujo.toBuffer();
    const tipoContenido = `image/${parametros.formato}`;
    return { buffer: convertido, tipoContenido };
  }

  public async rotar(buffer: Buffer, parametros: ParametrosRotacion): Promise<Buffer> {
    return sharp(buffer).rotate(parametros.angulo).toBuffer();
  }

  public async aplicarFiltro(buffer: Buffer, parametros: ParametrosFiltro): Promise<Buffer> {
    const flujo = sharp(buffer);
    switch (parametros.filtro) {
      case "blur":
        flujo.blur(parametros.valor ?? 5);
        break;
      case "sharpen":
        flujo.sharpen();
        break;
      case "grayscale":
        flujo.grayscale();
        break;
      default:
        throw new BadRequestError("Filtro solicitado no soportado", "INVALID_FILTER");
    }
    return flujo.toBuffer();
  }

  public async aplicarCanal(
    buffer: Buffer,
    operaciones: OperacionCanal[],
    tipoContenidoInicial: string
  ): Promise<{ buffer: Buffer; tipoContenido: string }> {
    let bufferTrabajo = buffer;
    let tipoContenidoActual = tipoContenidoInicial;

    for (const operacion of operaciones) {
      switch (operacion.tipo) {
        case "resize": {
          const { width, height, fit } = operacion.parametros ?? {};
          bufferTrabajo = await this.redimensionar(bufferTrabajo, {
            ancho: width as number | undefined,
            alto: height as number | undefined,
            ajuste: fit as AjusteImagen | undefined,
          });
          break;
        }
        case "crop": {
          const { left, top, width, height } = operacion.parametros ?? {};
          bufferTrabajo = await this.recortar(bufferTrabajo, {
            izquierda: left as number,
            arriba: top as number,
            ancho: width as number,
            alto: height as number,
          });
          break;
        }
        case "format": {
          const { format } = operacion.parametros ?? {};
          const resultado = await this.convertirFormato(bufferTrabajo, { formato: String(format) });
          bufferTrabajo = resultado.buffer;
          tipoContenidoActual = resultado.tipoContenido;
          break;
        }
        case "rotate": {
          const { angle } = operacion.parametros ?? {};
          bufferTrabajo = await this.rotar(bufferTrabajo, { angulo: angle as number });
          break;
        }
        case "filter": {
          const { filter, value } = operacion.parametros ?? {};
          bufferTrabajo = await this.aplicarFiltro(bufferTrabajo, {
            filtro: String(filter) as ParametrosFiltro["filtro"],
            valor: (value as number | undefined) ?? undefined,
          });
          break;
        }
        default:
          throw new BadRequestError(`Operación no soportada en la canalización: ${operacion.tipo}`, "INVALID_OPERATION");
      }
    }

    return { buffer: bufferTrabajo, tipoContenido: tipoContenidoActual };
  }
}
