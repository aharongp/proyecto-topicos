import { BadRequestError } from "../errors/AppError";
import { ServicioImagenes } from "../services/ImageService";
import type { ContextoManejadorImagen, ResultadoManejadorImagen } from "../types";
import { IManejadorImagen } from "./IImageHandler";
import {
  asegurarImagenCargada,
  verificarTamanoPermitido,
  obtenerExtensionDesdeMime,
  normalizarNombreArchivo,
  parsearAjuste,
  parsearEnteroPositivoOpcional,
} from "../utils/validators";

export class ManejadorRedimension implements IManejadorImagen {
  constructor(private readonly servicioImagenes: ServicioImagenes) {}

  public async manejar(contexto: ContextoManejadorImagen): Promise<ResultadoManejadorImagen> {
    const { archivo, cuerpo } = contexto;
    asegurarImagenCargada(archivo);
    verificarTamanoPermitido(archivo);

    const ancho = parsearEnteroPositivoOpcional(cuerpo.width, "width");
    const alto = parsearEnteroPositivoOpcional(cuerpo.height, "height");

    if (!ancho && !alto) {
      throw new BadRequestError("Se debe indicar el ancho o el alto", "MISSING_DIMENSIONS");
    }

    const ajuste = parsearAjuste(cuerpo.fit);

    const buffer = await this.servicioImagenes.redimensionar(archivo.buffer, {
      ancho,
      alto,
      ajuste,
    });
    const extension = obtenerExtensionDesdeMime(archivo.mimetype);
    const nombreArchivo = normalizarNombreArchivo(archivo.originalname, extension);

    return {
      buffer,
      tipoContenido: archivo.mimetype,
      nombreArchivo,
    };
  }
}
