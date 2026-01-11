export type NivelRegistro = "info" | "error";

export interface EntradaRegistro {
  fecha: string;
  nivel: NivelRegistro;
  usuario?: string;
  endpoint: string;
  parametros: Record<string, unknown>;
  duracion: number;
  resultado: "exito" | "error";
  mensaje?: string;
}

export interface IRegistrador {
  registrar(entrada: EntradaRegistro): Promise<void>;
}
