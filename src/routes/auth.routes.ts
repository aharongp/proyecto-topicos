import { Router } from "express";
import { AuthService } from "../services/AuthService";
import { BadRequestError } from "../errors/AppError";
import { ApiResponse } from "../types";

export function createAuthRouter(authService: AuthService): Router {
  const router = Router();

  router.post("/register", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        throw new BadRequestError("Email and password are required", "VALIDATION_ERROR");
      }

      const user = await authService.register({ email, password });

      const response: ApiResponse<{ id: string; email: string }> = {
        success: true,
        data: { id: user.id, email: user.email },
        timestamp: new Date().toISOString(),
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  });

  router.post("/login", async (req, res, next) => {
    try {
      const { email, password } = req.body ?? {};
      if (!email || !password) {
        throw new BadRequestError("Email and password are required", "VALIDATION_ERROR");
      }

      const token = await authService.login({ email, password });
      const response: ApiResponse<{ token: string }> = {
        success: true,
        data: { token },
        timestamp: new Date().toISOString(),
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
