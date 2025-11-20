import { ErrorCodes, ErrorMessages } from '../constants/error-codes';

/**
 * Clase personalizada para errores de la API
 */
export class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;
  public readonly details?: any;
  public readonly field?: string;

  constructor(
    code: keyof typeof ErrorCodes,
    statusCode: number,
    message?: string,
    details?: any,
    field?: string
  ) {
    const errorCode = ErrorCodes[code];
    const errorMessage = message || ErrorMessages[errorCode];
    super(errorMessage);

    this.code = errorCode;
    this.statusCode = statusCode;
    this.details = details;
    this.field = field;
    this.name = 'ApiError';

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }

  public toJSON() {
    return {
      code: this.code,
      message: this.message,
      ...(this.details && { details: this.details }),
      ...(this.field && { field: this.field }),
    };
  }
}

/**
 * Errores predefinidos comunes
 */
export class ProductNotFoundError extends ApiError {
  constructor(identifier: string) {
    super(
      'PRODUCT_NOT_FOUND',
      404,
      `Producto no encontrado: ${identifier}`
    );
  }
}

export class ProductAlreadyExistsError extends ApiError {
  constructor(field: string, value: string) {
    super(
      'PRODUCT_ALREADY_EXISTS',
      409,
      `Ya existe un producto con ${field}: ${value}`,
      undefined,
      field
    );
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, field?: string, details?: any) {
    super('VALIDATION_ERROR', 400, message, details, field);
  }
}

export class DatabaseError extends ApiError {
  constructor(message: string, details?: any) {
    super('DATABASE_ERROR', 500, message, details);
  }
}

export class MissingIdentifierError extends ApiError {
  constructor() {
    super(
      'MISSING_PRODUCT_IDENTIFIER',
      400,
      'Debe proporcionar al menos un identificador (código o referencia)'
    );
  }
}
