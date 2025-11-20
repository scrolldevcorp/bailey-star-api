/**
 * Tipos relacionados con el sistema de agentes IA
 */

// Estado del agente
export enum AgentStatus {
  IDLE = 'idle',
  THINKING = 'thinking',
  EXECUTING = 'executing',
  ERROR = 'error',
}

// Tipo de agente
export enum AgentType {
  ORCHESTRATOR = 'orchestrator',
  SALES = 'sales',
}

// Información de la empresa/agenc

// Contexto del agente
export interface AgentContext {
  conversationId: string;
  userId?: string;
  sessionId: string;
  metadata?: Record<string, unknown>;
}

// Respuesta del agente
export interface AgentResponse {
  success: boolean;
  message: string;
  data?: unknown;
  toolsUsed?: string[];
  nextAction?: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    breakdown?: Array<{
      step: string;
      promptTokens: number;
      completionTokens: number;
      totalTokens: number;
    }>;
  };
}

// Configuración del agente
export interface AgentConfig {
  type: AgentType;
  model: string;
  temperature?: number;
  maxTokens?: number;
  tools?: string[];
  frequencyPenalty?: number;
  presencePenalty?: number;
  topP?: number;
}

export interface Agent {
  id: string;
  type: AgentType;
  status: AgentStatus;
  execute(input: string, context: AgentContext): Promise<AgentResponse>;
}
