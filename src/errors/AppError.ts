export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(statusCode: number, code: string, message: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    Object.setPrototypeOf(this, new.target.prototype);
    Error.captureStackTrace?.(this, this.constructor);
  }
}

export class BadRequestError extends AppError {
  constructor(message: string, code = "SOLICITUD INCORRECTA") {
    super(400, code, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string, code = "NO AUTORIZADO") {
    super(401, code, message);
  }
}

export class UnsupportedMediaError extends AppError {
  constructor(message: string, code = "TIPO DE DATO NO COMPATIBLE") {
    super(415, code, message);
  }
}

export class EntityTooLargeError extends AppError {
  constructor(message: string, code = "CARGA ÚTIL DEMASIADO GRANDE") {
    super(413, code, message);
  }
}
