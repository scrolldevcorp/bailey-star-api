import { Response } from 'express';
import { ApiResponse, PaginatedResponse } from '../../domain/types/api-response.types';

/**
 * Constructor de respuestas estandarizadas
 */
export class ResponseBuilder {
  /**
   * Respuesta exitosa simple
   */
  static success<T>(res: Response, data: T, statusCode: number = 200): Response {
    const response: ApiResponse<T> = {
      success: true,
      data,
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta exitosa con paginación
   */
  static successPaginated<T>(
    res: Response,
    data: T[],
    page: number,
    limit: number,
    total: number,
    statusCode: number = 200
  ): Response {
    const totalPages = Math.ceil(total / limit);
    const response: PaginatedResponse<T> = {
      success: true,
      data,
      metadata: {
        page,
        limit,
        total,
        totalPages,
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de error
   */
  static error(
    res: Response,
    code: string,
    message: string,
    statusCode: number = 500,
    details?: any,
    field?: string
  ): Response {
    const response: ApiResponse = {
      success: false,
      error: {
        code,
        message,
        ...(details && { details }),
        ...(field && { field }),
      },
      metadata: {
        timestamp: new Date().toISOString(),
      },
    };
    return res.status(statusCode).json(response);
  }

  /**
   * Respuesta de creación exitosa
   */
  static created<T>(res: Response, data: T): Response {
    return this.success(res, data, 201);
  }

  /**
   * Respuesta sin contenido
   */
  static noContent(res: Response): Response {
    return res.status(204).send();
  }
}
