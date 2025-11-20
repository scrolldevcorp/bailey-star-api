import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './app/http/routes';
import { errorHandler } from './app/http/middlewares/error-handler.middleware';

/**
 * Crear y configurar la aplicación Express
 */
export const createApp = (): Application => {
  const app = express();

  // Middlewares de seguridad y parseo
  app.use(helmet());
  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Logging de requests en desarrollo
  if (process.env.NODE_ENV === 'development') {
    app.use((req, res, next) => {
      console.log(`${req.method} ${req.path}`);
      next();
    });
  }

  // Montar rutas
  app.use('/api', createRoutes());

  // Ruta raíz
  app.get('/', (req, res) => {
    res.json({
      success: true,
      data: {
        message: 'Bailey Star API - Inventory Management',
        version: '1.0.0',
        endpoints: {
          health: '/api/health',
          products: '/api/products',
        },
      },
    });
  });

  // Middleware de manejo de errores (debe ser el último)
  app.use(errorHandler);

  return app;
};
