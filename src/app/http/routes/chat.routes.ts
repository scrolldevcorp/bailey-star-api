// src/presentation/api/routes/chat.routes.ts
import { Router, Request, Response } from 'express';
import { AgentContext } from '../../../agents/types/agent.types';
import logger from '../../../core/utils/logger';
import { SalesAgent } from '../../../agents/salesAgent';

/**
 * Crear rutas para el chat con salesAgent
 */
export const createChatRoutes = (): Router => {
  const router = Router();

  // Instancia singleton del agente
  const salesAgent = new SalesAgent();

  /**
   * POST /api/chat
   * Endpoint principal para interactuar con el salesAgent
   */
  router.post('/', async (req: Request, res: Response) => {
    try {
      const { message, conversationId, userId, history } = req.body;

      // Validación de entrada
      if (!message || typeof message !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'El campo "message" es requerido y debe ser un string'
        });
      }

      // Construir contexto del agente
      const context: AgentContext = {
        conversationId: conversationId || `conv-${Date.now()}`,
        userId: userId || 'anonymous',
        sessionId: userId,
        metadata: {
          messages: history || [],
          timestamp: new Date().toISOString()
        }
      };

      logger.info(`📨 Chat request | User: ${context.userId} | Conv: ${context.conversationId} | Msg: "${message.substring(0, 50)}..."`);

      // Ejecutar el agente
      const response = await salesAgent.execute(message, context);

      // Preparar respuesta
      const responseData = {
        success: response.success,
        message: response.message,
        conversationId: context.conversationId,
        timestamp: new Date().toISOString(),
        toolsUsed: response.toolsUsed || [],
        usage: response.usage ? {
          totalTokens: response.usage.totalTokens,
          promptTokens: response.usage.promptTokens,
          completionTokens: response.usage.completionTokens,
          ...(process.env.NODE_ENV === 'development' && {
            breakdown: response.usage.breakdown
          })
        } : undefined
      };

      logger.info(`✅ Response sent | Tools: ${response.toolsUsed?.length || 0} | Tokens: ${response.usage?.totalTokens || 0}`);

      return res.status(200).json(responseData);

    } catch (error) {
      logger.error('❌ Error en /api/chat:', error);
      
      return res.status(500).json({
        success: false,
        error: 'Error interno del servidor',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  /**
   * GET /api/chat/health
   * Health check del servicio de chat
   */
  router.get('/health', async (req: Request, res: Response) => {
    try {
      const status = {
        success: true,
        data: {
          status: 'healthy',
          service: 'FlightAgent',
          timestamp: new Date().toISOString(),
        }
      };

      return res.status(200).json(status);
    } catch (error) {
      logger.error('❌ Error en chat health check:', error);
      return res.status(503).json({
        success: false,
        error: 'Service unavailable',
        message: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  /**
   * GET /api/chat/tools
   * Obtener lista de herramientas MCP disponibles
   */
  router.get('/tools', async (req: Request, res: Response) => {
    try {
      const { mcpToolsService } = await import('../../../agents/services/mcpToolsService');
      const tools = await mcpToolsService.getToolsForOpenAI();
      
      // Type guard para filtrar solo tools estándar
      const standardTools = tools.filter((t): t is { type: 'function'; function: { name: string; description: string; parameters: any } } => {
        return t.type === 'function' && 'function' in t && typeof t.function === 'object' && t.function !== null;
      });
      
      return res.status(200).json({
        success: true,
        data: {
          count: standardTools.length,
          tools: standardTools.map(t => ({
            name: t.function.name,
            description: t.function.description
          }))
        }
      });
    } catch (error) {
      logger.error('❌ Error obteniendo tools:', error);
      return res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido'
      });
    }
  });

  return router;
};