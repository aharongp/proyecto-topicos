import type { ContextoManejadorImagen, ResultadoManejadorImagen } from "../types";
import { IManejadorImagen } from "../handlers/IImageHandler";
import type { IRegistrador } from "../logging/ILogger";
import { sanearParametros } from "../utils/validators";

export class DecoradorRegistro implements IManejadorImagen {
  constructor(private readonly interno: IManejadorImagen, private readonly registrador: IRegistrador) {}

  public async manejar(contexto: ContextoManejadorImagen): Promise<ResultadoManejadorImagen> {
    const inicio = Date.now();
    try {
      const resultado = await this.interno.manejar(contexto);
      await this.registrador.registrar({
        fecha: new Date().toISOString(),
        nivel: "info",
        usuario: contexto.solicitud.usuario?.correo ?? contexto.solicitud.usuario?.id,
        endpoint: contexto.endpoint,
        parametros: sanearParametros(contexto.cuerpo),
        duracion: Date.now() - inicio,
        resultado: "exito",
      });
      return resultado;
    } catch (error) {
      await this.registrador.registrar({
        fecha: new Date().toISOString(),
        nivel: "error",
        usuario: contexto.solicitud.usuario?.correo ?? contexto.solicitud.usuario?.id,
        endpoint: contexto.endpoint,
        parametros: sanearParametros(contexto.cuerpo),
        duracion: Date.now() - inicio,
        resultado: "error",
        mensaje: (error as Error).message,
      });
      throw error;
    }
  }
}
