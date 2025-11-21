import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createRoutes } from './app/http/routes';
import { errorHandler } from './app/http/middlewares/error-handler.middleware';
import { Pool, QueryResult } from 'pg';

import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { createMcpServer } from './mcp/mcpServer';
import { ProductService } from './domain/services/product.service';
import { ProductRepository } from './infrastructure/repositories/postgress-product.repository';
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

  const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: Number(process.env.DB_PORT),
  });

  const productService = new ProductService(new ProductRepository(pool))
  const { mcpServer, tools } = createMcpServer(productService);

  app.post('/mcp', async (req: Request, res: Response) => {
  // In stateless mode, create a new instance of transport and server for each request
  // to ensure complete isolation. A single instance would cause request ID collisions
  // when multiple clients connect concurrently.
  
  try {
    const server = mcpServer; 
    const transport: StreamableHTTPServerTransport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    res.on('close', () => {
      console.log('Request closed');
      transport.close(); // Solo cerramos el transporte de la petición
      // No cerramos el servidor MCP global
    });
    await server.connect(transport);
    await transport.handleRequest(req, res, req.body);
  } catch (error) {
    console.log('Error handling MCP request', error);
    if (!res.headersSent) {
      res.status(500).json({
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal server error',
        },
        id: null,
      });
    }
  }
});

// SSE notifications not supported in stateless mode
app.get('/mcp', async (req: Request, res: Response) => {
  console.log('Received GET MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});

// Session termination not needed in stateless mode
app.delete('/mcp', async (req: Request, res: Response) => {
  console.log('Received DELETE MCP request');
  res.writeHead(405).end(JSON.stringify({
    jsonrpc: "2.0",
    error: {
      code: -32000,
      message: "Method not allowed."
    },
    id: null
  }));
});


  // Middleware de manejo de errores (debe ser el último)
  app.use(errorHandler);

  return app;
};
