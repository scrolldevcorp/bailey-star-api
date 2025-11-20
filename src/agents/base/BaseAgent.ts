import { AIService, aiService } from '../services/aiService';
import { Agent, AgentType, AgentStatus, AgentContext, AgentResponse, AgentConfig } from '../types/agent.types';

/**
 * Clase base abstracta para todos los agentes
 * Implementa funcionalidad común y define el contrato para agentes específicos
 */
export abstract class BaseAgent implements Agent {
  public id: string;
  public type: AgentType;
  public status: AgentStatus;
  protected config: AgentConfig;
  protected aiService: AIService;

  constructor(config: AgentConfig) {
    this.id = `${config.type}-${Date.now()}`;
    this.type = config.type;
    this.status = AgentStatus.IDLE;
    this.config = config;
    this.aiService = aiService;
  }

  /**
   * Método abstracto que debe ser implementado por cada agente específico
   */
  abstract execute(input: string, context: AgentContext): Promise<AgentResponse>;

  /**
   * Actualizar estado del agente
   */
  protected updateStatus(status: AgentStatus): void {
    this.status = status;
  }

  /**
   * Validar contexto antes de ejecutar
   */
  protected validateContext(context: AgentContext): boolean {
    return !!(context.conversationId && context.sessionId);
  }

  /**
   * Manejar errores de forma consistente
   */
  protected handleError(error: Error | unknown): AgentResponse {
    this.updateStatus(AgentStatus.ERROR);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Error desconocido',
      data: null,
    };
  }
}
