import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import type { Model } from "mongoose";
import { BadRequestError, UnauthorizedError } from "../errors/AppError";
import type { JwtPayload } from "../types";
import type { User, UserDocument } from "../models/User";

export interface RegistrationData {
  email: string;
  password: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export class AuthService {
  constructor(
    private readonly userModel: Model<User>,
    private readonly jwtSecret: string,
    private readonly jwtExpiration: string | number
  ) {}

  public async register(data: RegistrationData): Promise<UserDocument> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const existing = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (existing) {
      throw new BadRequestError("Email is already registered", "EMAIL_EXISTS");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.userModel.create({
      email: normalizedEmail,
      password: hashedPassword,
    });

    return user;
  }

  public async login(data: LoginData): Promise<string> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const user = await this.userModel.findOne({ email: normalizedEmail }).exec();
    if (!user) {
      throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
    }

    return this.generateToken(user);
  }

  public async verifyToken(token: string): Promise<JwtPayload> {
    try {
      const decoded = jwt.verify(token, this.jwtSecret) as jwt.JwtPayload;
      if (!decoded.sub || !decoded.email) {
        throw new Error("Token does not contain required fields");
      }

      return {
        sub: String(decoded.sub),
        email: String(decoded.email),
        iat: Number(decoded.iat ?? 0),
        exp: Number(decoded.exp ?? 0),
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid or expired token", "INVALID_TOKEN");
    }
  }

  private generateToken(user: UserDocument): string {
    const payload = { email: user.email };
    const options: SignOptions = {
      subject: user.id,
      expiresIn: this.jwtExpiration as SignOptions["expiresIn"],
    };
    return jwt.sign(payload, this.jwtSecret, options);
  }


}