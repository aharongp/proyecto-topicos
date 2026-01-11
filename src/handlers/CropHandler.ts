import { ServicioImagenes } from "../services/ImageService";
import type { ContextoManejadorImagen, ResultadoManejadorImagen } from "../types";
import { IManejadorImagen } from "./IImageHandler";
import {
  asegurarImagenCargada,
  verificarTamanoPermitido,
  obtenerExtensionDesdeMime,
  normalizarNombreArchivo,
  parsearEnteroNoNegativo,
  parsearEnteroPositivo,
} from "../utils/validators";

export class ManejadorRecorte implements IManejadorImagen {
  constructor(private readonly servicioImagenes: ServicioImagenes) {}

  public async manejar(contexto: ContextoManejadorImagen): Promise<ResultadoManejadorImagen> {
    const { archivo, cuerpo } = contexto;
    asegurarImagenCargada(archivo);
    verificarTamanoPermitido(archivo);

    const izquierda = parsearEnteroNoNegativo(cuerpo.left, "left");
    const arriba = parsearEnteroNoNegativo(cuerpo.top, "top");
    const ancho = parsearEnteroPositivo(cuerpo.width, "width");
    const alto = parsearEnteroPositivo(cuerpo.height, "height");

    const buffer = await this.servicioImagenes.recortar(archivo.buffer, {
      izquierda,
      arriba,
      ancho,
      alto,
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
