import { body, query, ValidationChain } from 'express-validator';

/**
 * Validadores para operaciones de productos
 */
export class ProductValidator {
  /**
   * Validación para crear producto
   */
  static create(): ValidationChain[] {
    return [
      body('code')
        .optional({ nullable: true })
        .isString()
        .withMessage('El código debe ser una cadena de texto')
        .trim()
        .isLength({ max: 50 })
        .withMessage('El código no puede exceder 50 caracteres'),

      body('reference')
        .notEmpty()
        .withMessage('La referencia es requerida')
        .isString()
        .withMessage('La referencia debe ser una cadena de texto')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La referencia debe tener entre 1 y 100 caracteres'),

      body('description')
        .notEmpty()
        .withMessage('La descripción es requerida')
        .isString()
        .withMessage('La descripción debe ser una cadena de texto')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('La descripción debe tener entre 1 y 500 caracteres'),

      body('stock')
        .notEmpty()
        .withMessage('La existencia es requerida')
        .isFloat({ min: 0 })
        .withMessage('La existencia debe ser un número positivo o cero'),

      body('wholesale_price_bs')
        .notEmpty()
        .withMessage('El precio al mayor en bolívares es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio al mayor en bolívares debe ser un número positivo'),

      body('retail_price')
        .notEmpty()
        .withMessage('El precio al detal es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio al detal debe ser un número positivo'),

      body('wholesale_price_usd')
        .notEmpty()
        .withMessage('El precio al mayor en divisas es requerido')
        .isFloat({ min: 0 })
        .withMessage('El precio al mayor en divisas debe ser un número positivo'),
    ];
  }

  /**
   * Validación para upsert de producto (mismas reglas que create)
   */
  static upsert(): ValidationChain[] {
    return this.create();
  }

  /**
   * Validación para actualizar producto
   */
  static update(): ValidationChain[] {
    return [
      body('code')
        .optional({ nullable: true })
        .isString()
        .withMessage('El código debe ser una cadena de texto')
        .trim()
        .isLength({ max: 50 })
        .withMessage('El código no puede exceder 50 caracteres'),

      body('reference')
        .optional()
        .isString()
        .withMessage('La referencia debe ser una cadena de texto')
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('La referencia debe tener entre 1 y 100 caracteres'),

      body('description')
        .optional()
        .isString()
        .withMessage('La descripción debe ser una cadena de texto')
        .trim()
        .isLength({ min: 1, max: 500 })
        .withMessage('La descripción debe tener entre 1 y 500 caracteres'),

      body('stock')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('La existencia debe ser un número positivo o cero'),

      body('wholesale_price_bs')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio al mayor en bolívares debe ser un número positivo'),

      body('retail_price')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio al detal debe ser un número positivo'),

      body('wholesale_price_usd')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio al mayor en divisas debe ser un número positivo'),
    ];
  }

  /**
   * Validación para búsqueda con filtros
   */
  static search(): ValidationChain[] {
    return [
      query('code')
        .optional()
        .isString()
        .withMessage('El código debe ser una cadena de texto'),

      query('reference')
        .optional()
        .isString()
        .withMessage('La referencia debe ser una cadena de texto'),

      query('description')
        .optional()
        .isString()
        .withMessage('La descripción debe ser una cadena de texto'),

      query('minStock')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El stock mínimo debe ser un número positivo'),

      query('maxStock')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El stock máximo debe ser un número positivo'),

      query('minPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio mínimo debe ser un número positivo'),

      query('maxPrice')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('El precio máximo debe ser un número positivo'),

      query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('La página debe ser un número entero mayor a 0'),

      query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('El límite debe ser un número entre 1 y 100'),
    ];
  }

  /**
   * Validación para identificadores en parámetros de ruta
   */
  static identifier(): ValidationChain[] {
    return [
      query('code')
        .optional()
        .isString()
        .withMessage('El código debe ser una cadena de texto'),

      query('reference')
        .optional()
        .isString()
        .withMessage('La referencia debe ser una cadena de texto'),
    ];
  }
}
