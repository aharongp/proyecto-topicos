import { connection } from "mongoose";
import { EntradaRegistro, IRegistrador } from "./ILogger";

export class RegistradorMongo implements IRegistrador {
  constructor(private readonly nombreColeccion = "logs") {}

  public async registrar(entrada: EntradaRegistro): Promise<void> {
    if (connection.readyState !== 1) {
      return;
    }

    await connection.collection(this.nombreColeccion).insertOne(entrada);
  }
}
