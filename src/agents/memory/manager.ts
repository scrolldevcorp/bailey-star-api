import { conversationRepository } from '../db/repositories/conversationRepository';
import { messageRepository } from '../db/repositories/messageRepository';
import { MessageRole, MemoryContext } from '../types/conversation.types';

/**
 * Gestor de Memoria
 * Coordina el almacenamiento y recuperación de conversaciones y mensajes
 * Proporciona contexto para los agentes
 */
export class MemoryManager {
  private conversationRepo = conversationRepository;
  private messageRepo = messageRepository;

  /**
   * Crear una nueva conversación
   */
  async createConversation(sessionId: string, userId?: string) {
    return await this.conversationRepo.create(sessionId, userId);
  }

  /**
   * Buscar conversación por sessionId
   */
  async findConversationBySessionId(sessionId: string) {
    return await this.conversationRepo.findBySessionId(sessionId);
  }

  /**
   * Agregar mensaje a conversación (usa sessionId)
   */
  async addMessage(
    sessionId: string,
    role: MessageRole,
    content: string,
    metadata?: Record<string, unknown>
  ) {
    // Formato compatible con dashboard CRM
    const messageData = {
      type: role === MessageRole.USER ? 'human' : role === MessageRole.ASSISTANT ? 'ai' : 'system',
      content: content,
      additional_kwargs: metadata || {},
      response_metadata: {}
    };
    
    return await this.messageRepo.create(sessionId, messageData);
  }

  /**
   * Obtener contexto de memoria para un agente (por sessionId)
   */
  async getMemoryContext(sessionId: string, messageLimit: number = 10): Promise<MemoryContext> {
    const recentMessages = await this.messageRepo.findRecent(sessionId, messageLimit);
    
    return {
      conversationId: sessionId,
      recentMessages: recentMessages.map((msg) => ({
        id: msg.id.toString(),
        conversationId: sessionId, // Agregar conversationId requerido
        role: msg.message.type === 'human' ? MessageRole.USER : msg.message.type === 'ai' ? MessageRole.ASSISTANT : MessageRole.SYSTEM,
        content: msg.message.content,
        metadata: msg.message.additional_kwargs,
        createdAt: new Date(msg.created_at)
      })),
      summary: undefined,
      entities: {},
    };
  }

  /**
   * Obtener historial completo por sessionId
   */
  async getConversationHistory(sessionId: string) {
    const messages = await this.messageRepo.findBySessionId(sessionId);
    
    // Transformar al formato esperado por el agente
    return messages.map((msg) => ({
      id: msg.id,
      role: msg.message.type === 'human' ? 'user' : msg.message.type === 'ai' ? 'assistant' : 'system',
      content: msg.message.content,
      metadata: msg.message.additional_kwargs,
      createdAt: msg.created_at
    }));
  }

  /**
   * Limpiar conversación por sessionId
   */
  async clearConversation(sessionId: string): Promise<void> {
    await this.messageRepo.deleteBySessionId(sessionId);
  }
}
