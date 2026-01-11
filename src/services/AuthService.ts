import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Model } from "mongoose";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";
import type { CargaTokenAutenticacion } from "../types";
import type { User, UserDocument } from "../models/User";

export interface DatosRegistro {
  correo: string;
  contrasena: string;
}

export interface DatosInicioSesion {
  correo: string;
  contrasena: string;
}

export class ServicioAutenticacion {
  constructor(
    private readonly modeloUsuario: Model<User>,
    private readonly secretoJwt: string,
    private readonly expiracionJwt: string | number
  ) {}

  public async registrar(datos: DatosRegistro): Promise<UserDocument> {
    const correoNormalizado = datos.correo.trim().toLowerCase();
    const existente = await this.modeloUsuario.findOne({ email: correoNormalizado }).exec();
    if (existente) {
      throw new BadRequestError("El correo ya está registrado", "EMAIL_EXISTS");
    }

    const contrasenaHasheada = await bcrypt.hash(datos.contrasena, 10);
    const usuario = await this.modeloUsuario.create({
      email: correoNormalizado,
      password: contrasenaHasheada,
    });

    return usuario;
  }

  public async iniciarSesion(datos: DatosInicioSesion): Promise<string> {
    const correoNormalizado = datos.correo.trim().toLowerCase();
    const usuario = await this.modeloUsuario.findOne({ email: correoNormalizado }).exec();
    if (!usuario) {
      throw new UnauthorizedError("Credenciales inválidas", "INVALID_CREDENTIALS");
    }

    const esValido = await bcrypt.compare(datos.contrasena, usuario.password);
    if (!esValido) {
      throw new UnauthorizedError("Credenciales inválidas", "INVALID_CREDENTIALS");
    }

    return this.generarToken(usuario);
  }

  public async verificarToken(token: string): Promise<CargaTokenAutenticacion> {
    try {
      const decodificado = jwt.verify(token, this.secretoJwt) as jwt.JwtPayload;
      if (!decodificado.sub || !decodificado.email) {
        throw new Error("El token no contiene los campos requeridos");
      }

      return {
        sub: String(decodificado.sub),
        correo: String(decodificado.email),
        iat: Number(decodificado.iat ?? 0),
        exp: Number(decodificado.exp ?? 0),
      };
    } catch (error) {
      throw new UnauthorizedError("Token inválido o expirado", "INVALID_TOKEN");
    }
  }

  private generarToken(usuario: UserDocument): string {
    const carga = { email: usuario.email };
    const opciones: SignOptions = {
      subject: usuario.id,
      expiresIn: this.expiracionJwt as SignOptions["expiresIn"],
    };
    return jwt.sign(carga, this.secretoJwt, opciones);
  }
}
