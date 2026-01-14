import { UnauthorizedError } from "../errors/AppError";
import type { ImageHandlerContext, ImageHandlerResult } from "../types";
import { AuthService } from "../services/AuthService";
import { IImageHandler } from "../handlers/IImageHandler";

export class DecoratorAuthentication implements IImageHandler {
  constructor(private readonly interno: IImageHandler, private readonly authService: AuthService) {}

  public async handle(context: ImageHandlerContext): Promise<ImageHandlerResult> {
    const authorization = context.request.headers.authorization;
    if (!authorization || !authorization.startsWith("Bearer ")) {
      throw new UnauthorizedError("Authorization header is missing or invalid", "TOKEN_MISSING");
    }

    const token = authorization.substring("Bearer ".length);
    const payload = await this.authService.verifyToken(token);
    context.request.user = {email: payload.email };

    return this.interno.handle(context);
  }
}
