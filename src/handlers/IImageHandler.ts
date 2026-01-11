import type { ContextoManejadorImagen, ResultadoManejadorImagen } from "../types";

export interface IManejadorImagen {
  manejar(contexto: ContextoManejadorImagen): Promise<ResultadoManejadorImagen>;
}
