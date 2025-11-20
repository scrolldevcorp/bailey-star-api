/**
 * Tipos para el sistema de conversaciones y memoria
 */

// Rol del mensaje
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
  TOOL = 'tool',
}

// Mensaje individual
export interface Message {
  id: string;
  conversationId: string;
  role: MessageRole;
  content: string;
  metadata?: Record<string, unknown>;
  toolCalls?: ToolCall[];
  createdAt: Date;
}

// Llamada a herramienta
export interface ToolCall {
  id: string;
  toolName: string;
  parameters: Record<string, unknown>;
  result?: unknown;
}

// Conversación
export interface Conversation {
  id: string;
  userId?: string;
  sessionId: string;
  status: ConversationStatus;
  messages: Message[];
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// Estado de la conversación
export enum ConversationStatus {
  ACTIVE = 'active',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
}

// Contexto de memoria
export interface MemoryContext {
  conversationId: string;
  recentMessages: Message[];
  summary?: string;
  entities?: Record<string, unknown>;
}
