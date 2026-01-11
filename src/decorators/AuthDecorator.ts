import { UnauthorizedError } from "../errors/AppError";
import type { ContextoManejadorImagen, ResultadoManejadorImagen } from "../types";
import { ServicioAutenticacion } from "../services/AuthService";
import { IManejadorImagen } from "../handlers/IImageHandler";

export class DecoradorAutenticacion implements IManejadorImagen {
  constructor(private readonly interno: IManejadorImagen, private readonly servicioAutenticacion: ServicioAutenticacion) {}

  public async manejar(contexto: ContextoManejadorImagen): Promise<ResultadoManejadorImagen> {
    const autorizacion = contexto.solicitud.headers.authorization;
    if (!autorizacion || !autorizacion.startsWith("Bearer ")) {
      throw new UnauthorizedError("Falta el encabezado de autorización", "TOKEN_MISSING");
    }

    const token = autorizacion.substring("Bearer ".length);
    const carga = await this.servicioAutenticacion.verificarToken(token);
    contexto.solicitud.usuario = { id: carga.sub, correo: carga.correo };

    return this.interno.manejar(contexto);
  }
}
