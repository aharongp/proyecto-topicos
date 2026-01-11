import { EntradaRegistro, IRegistrador } from "./ILogger";

export class RegistradorCompuesto implements IRegistrador {
  constructor(private readonly registradores: IRegistrador[]) {}

  public async registrar(entrada: EntradaRegistro): Promise<void> {
    await Promise.all(this.registradores.map((registrador) => registrador.registrar(entrada)));
  }
}
