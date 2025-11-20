import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationError as ExpressValidationError } from 'express-validator';
import { ResponseBuilder } from '../../../core/utils/response-builder';
import { ErrorCodes } from '../../../core/constants/error-codes';

/**
 * Middleware para procesar resultados de validación
 */
export const handleValidationErrors = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const errorDetails = errors.array().map((error: any) => ({
      field: error.path || error.param,
      message: error.msg,
      value: error.value,
    }));

    ResponseBuilder.error(
      res,
      ErrorCodes.VALIDATION_ERROR,
      'Error de validación en los datos enviados',
      400,
      errorDetails
    );
    return;
  }

  next();
};
