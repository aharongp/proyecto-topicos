import { promises as fs } from "fs";
import { dirname } from "path";
import { EntradaRegistro, IRegistrador } from "./ILogger";

export class RegistradorArchivo implements IRegistrador {
  constructor(private readonly rutaArchivo: string) {}

  public async registrar(entrada: EntradaRegistro): Promise<void> {
    const serializado = JSON.stringify(entrada);
    await fs.mkdir(dirname(this.rutaArchivo), { recursive: true });
    await fs.appendFile(this.rutaArchivo, `${serializado}\n`, { encoding: "utf-8" });
  }
}
