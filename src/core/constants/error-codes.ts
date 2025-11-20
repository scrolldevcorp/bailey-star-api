/**
 * Códigos de error estandarizados para la API
 */

export const ErrorCodes = {
  // Errores generales (1000-1999)
  INTERNAL_SERVER_ERROR: 'ERR_1000',
  INVALID_REQUEST: 'ERR_1001',
  VALIDATION_ERROR: 'ERR_1002',
  DATABASE_ERROR: 'ERR_1003',
  
  // Errores de productos (2000-2999)
  PRODUCT_NOT_FOUND: 'ERR_2000',
  PRODUCT_ALREADY_EXISTS: 'ERR_2001',
  INVALID_PRODUCT_IDENTIFIER: 'ERR_2002',
  MISSING_PRODUCT_IDENTIFIER: 'ERR_2003',
  DUPLICATE_PRODUCT_CODE: 'ERR_2004',
  DUPLICATE_PRODUCT_REFERENCE: 'ERR_2005',
  INVALID_STOCK_VALUE: 'ERR_2006',
  INVALID_PRICE_VALUE: 'ERR_2007',
  
  // Errores de validación (3000-3999)
  REQUIRED_FIELD_MISSING: 'ERR_3000',
  INVALID_FIELD_TYPE: 'ERR_3001',
  INVALID_FIELD_VALUE: 'ERR_3002',
  FIELD_TOO_LONG: 'ERR_3003',
  FIELD_TOO_SHORT: 'ERR_3004',
} as const;

export const ErrorMessages = {
  [ErrorCodes.INTERNAL_SERVER_ERROR]: 'Error interno del servidor',
  [ErrorCodes.INVALID_REQUEST]: 'Solicitud inválida',
  [ErrorCodes.VALIDATION_ERROR]: 'Error de validación en los datos enviados',
  [ErrorCodes.DATABASE_ERROR]: 'Error en la base de datos',
  
  [ErrorCodes.PRODUCT_NOT_FOUND]: 'Producto no encontrado',
  [ErrorCodes.PRODUCT_ALREADY_EXISTS]: 'El producto ya existe',
  [ErrorCodes.INVALID_PRODUCT_IDENTIFIER]: 'Identificador de producto inválido',
  [ErrorCodes.MISSING_PRODUCT_IDENTIFIER]: 'Debe proporcionar al menos un identificador (código o referencia)',
  [ErrorCodes.DUPLICATE_PRODUCT_CODE]: 'Ya existe un producto con ese código',
  [ErrorCodes.DUPLICATE_PRODUCT_REFERENCE]: 'Ya existe un producto con esa referencia',
  [ErrorCodes.INVALID_STOCK_VALUE]: 'El valor de existencia debe ser un número positivo',
  [ErrorCodes.INVALID_PRICE_VALUE]: 'El valor del precio debe ser un número positivo',
  
  [ErrorCodes.REQUIRED_FIELD_MISSING]: 'Campo requerido faltante',
  [ErrorCodes.INVALID_FIELD_TYPE]: 'Tipo de dato inválido para el campo',
  [ErrorCodes.INVALID_FIELD_VALUE]: 'Valor inválido para el campo',
  [ErrorCodes.FIELD_TOO_LONG]: 'El valor del campo es demasiado largo',
  [ErrorCodes.FIELD_TOO_SHORT]: 'El valor del campo es demasiado corto',
} as const;
