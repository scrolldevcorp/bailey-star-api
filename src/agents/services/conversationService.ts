import { MemoryManager } from '../memory/manager';
import { FlightAgent } from '../agents/flightAgent';
import { MessageRole } from '../types/conversation.types';
import { AgentContext, CompanyInfo } from '../types/agent.types';
import logger from '../utils/logger';

/**
 * Servicio de Conversación
 * Maneja la interacción directa entre usuario y FlightAgent
 * Simplificado sin orchestrator para mayor eficiencia
 */
export class ConversationService {
  private memoryManager: MemoryManager;
  private flightAgent: FlightAgent;

  constructor() {
    this.memoryManager = new MemoryManager();
    this.flightAgent = new FlightAgent();
    
    logger.info('✅ ConversationService inicializado con FlightAgent directo (sin orchestrator)');
  }

  /**
   * Iniciar nueva conversación
   */
  async startConversation(sessionId: string, userId?: string): Promise<string> {
    const conversation = await this.memoryManager.createConversation(sessionId, userId);
    return conversation.id;
  }

  /**
   * Buscar conversación por sessionId o crear una nueva
   */
  async findOrCreateConversation(sessionId: string, userId?: string) {
    // Buscar conversación existente
    const existing = await this.memoryManager.findConversationBySessionId(sessionId);
    
    if (existing) {
      return existing;
    }

    // Si no existe, crear nueva
    const conversation = await this.memoryManager.createConversation(sessionId, userId);
    return conversation;
  }

  /**
   * Procesar mensaje del usuario (usa sessionId)
   * Ejecuta directamente FlightAgent sin orchestrator
   */
  async processMessage(sessionId: string, userMessage: string, companyInfo?: CompanyInfo) {
    try {
      logger.info(`📨 Procesando mensaje para sessionId: ${sessionId}`);
      
      // Guardar mensaje del usuario
      await this.memoryManager.addMessage(
        sessionId,
        MessageRole.USER,
        userMessage
      );

      // Obtener historial completo de la conversación
      const conversationHistory = await this.memoryManager.getConversationHistory(sessionId);

      // Crear contexto para el agente con el historial y companyInfo
      const agentContext: AgentContext = {
        conversationId: sessionId,
        sessionId: sessionId,
        companyInfo: companyInfo,
        metadata: {
          messages: conversationHistory,
        },
      };

      // Ejecutar FlightAgent directamente (sin orchestrator)
      logger.info('🛫 Ejecutando FlightAgent directamente');
      const agentResponse = await this.flightAgent.execute(userMessage, agentContext);

      // Guardar respuesta del asistente (sin data para reducir almacenamiento)
      await this.memoryManager.addMessage(
        sessionId,
        MessageRole.ASSISTANT,
        agentResponse.message,
        {
          toolsUsed: agentResponse.toolsUsed,
          // data eliminado - no guardar resultados completos de tools
        }
      );

      logger.info(`✅ Mensaje procesado exitosamente para sessionId: ${sessionId}`);

      return {
        message: agentResponse.message,
        data: agentResponse.data,
        success: agentResponse.success,
        toolsUsed: agentResponse.toolsUsed,
      };

    } catch (error) {
      logger.error(`❌ Error procesando mensaje para sessionId ${sessionId}:`, error);
      throw new Error(`Error procesando mensaje: ${error instanceof Error ? error.message : 'Error desconocido'}`);
    }
  }

  /**
   * Obtener historial de conversación por sessionId
   */
  async getHistory(sessionId: string) {
    return await this.memoryManager.getConversationHistory(sessionId);
  }
}

export default new ConversationService();
