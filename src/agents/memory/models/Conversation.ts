/**
 * Modelo de Conversación
 * Representa una conversación completa con el usuario
 * Este archivo define la estructura, Prisma generará el modelo real
 */

export interface ConversationModel {
  id: string;
  userId?: string;
  sessionId: string;
  status: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
}

// TODO: Después de crear el schema de Prisma, importar desde @prisma/client
// export type Conversation = Prisma.Conversation;
