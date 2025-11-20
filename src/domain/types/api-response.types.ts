/**
 * Tipos para respuestas estandarizadas de la API
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ApiError;
  metadata?: ResponseMetadata;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface ResponseMetadata {
  page?: number;
  limit?: number;
  total?: number;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  metadata: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    timestamp: string;
  };
}
