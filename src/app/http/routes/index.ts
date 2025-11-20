import { Router } from 'express';
import { createProductRoutes } from './product.routes';

import Database from '../../../infrastructure/db/database';
import { ProductRepository } from '../../../infrastructure/repositories/postgress-product.repository';
import { ProductService } from '../../../domain/services/product.service';
import { ProductController } from '../controllers/product.controller';
import { createChatRoutes } from './chat.routes';

/**
 * Configurar todas las rutas de la aplicación
 */
export const createRoutes = (): Router => {
  const router = Router();

  // Obtener instancia de la base de datos
  const database = Database.getInstance();
  const pool = database.getPool();

  // Inicializar dependencias para productos
  const productRepository = new ProductRepository(pool);
  const productService = new ProductService(productRepository);
  const productController = new ProductController(productService);

  // Montar rutas de productos
  router.use('/products', createProductRoutes(productController));
  router.use('/chat', createChatRoutes());

  // Ruta de health check
  router.get('/health', (req, res) => {
    res.json({
      success: true,
      data: {
        status: 'OK',
        timestamp: new Date().toISOString(),
      },
    });
  });

  return router;
};
