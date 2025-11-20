import { Router } from 'express';
import { ProductValidator } from '../../../core/validators/product.validator';
import { handleValidationErrors } from '../middlewares/validation.middleware';
import { asyncHandler } from '../middlewares/async-handler.middleware';
import { ProductController } from '../controllers/product.controller';

/**
 * Configurar rutas de productos
 */
export const createProductRoutes = (productController: ProductController): Router => {
  const router = Router();

  /**
   * @route   POST /api/products
   * @desc    Crear un nuevo producto
   * @access  Public
   */
  router.post(
    '/',
    ProductValidator.create(),
    handleValidationErrors,
    asyncHandler(productController.createProduct)
  );

  /**
   * @route   PUT /api/products/upsert
   * @desc    Crear o actualizar un producto (upsert)
   * @access  Public
   */
  router.put(
    '/upsert',
    ProductValidator.create(),
    handleValidationErrors,
    asyncHandler(productController.upsertProduct)
  );

  /**
   * @route   GET /api/products
   * @desc    Listar productos con filtros y paginación
   * @access  Public
   */
  router.get(
    '/',
    ProductValidator.search(),
    handleValidationErrors,
    asyncHandler(productController.listProducts)
  );

  /**
   * @route   GET /api/products/by-identifier
   * @desc    Obtener producto por código o referencia
   * @access  Public
   */
  router.get(
    '/by-identifier',
    ProductValidator.identifier(),
    handleValidationErrors,
    asyncHandler(productController.getProductByIdentifier)
  );

  /**
   * @route   GET /api/products/:id
   * @desc    Obtener producto por ID
   * @access  Public
   */
  router.get('/:id', asyncHandler(productController.getProductById));

  /**
   * @route   PATCH /api/products
   * @desc    Actualizar producto por código o referencia
   * @access  Public
   */
  router.patch(
    '/',
    ProductValidator.identifier(),
    ProductValidator.update(),
    handleValidationErrors,
    asyncHandler(productController.updateProduct)
  );

  /**
   * @route   DELETE /api/products
   * @desc    Eliminar producto por código o referencia
   * @access  Public
   */
  router.delete(
    '/',
    ProductValidator.identifier(),
    handleValidationErrors,
    asyncHandler(productController.deleteProduct)
  );

  return router;
};
