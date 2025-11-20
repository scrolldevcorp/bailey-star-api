import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../../core/utils/api-error';
import { ResponseBuilder } from '../../../core/utils/response-builder';
import { ErrorCodes } from '../../../core/constants/error-codes';

/**
 * Middleware global para manejo de errores
 */
export const errorHandler = (
  error: Error | ApiError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error('Error:', error);

  // Si es un ApiError personalizado
  if (error instanceof ApiError) {
    ResponseBuilder.error(
      res,
      error.code,
      error.message,
      error.statusCode,
      error.details,
      error.field
    );
    return;
  }

  // Error genérico no manejado
  ResponseBuilder.error(
    res,
    ErrorCodes.INTERNAL_SERVER_ERROR,
    'Ha ocurrido un error interno en el servidor',
    500,
    process.env.NODE_ENV === 'development' ? { stack: error.stack } : undefined
  );
};
