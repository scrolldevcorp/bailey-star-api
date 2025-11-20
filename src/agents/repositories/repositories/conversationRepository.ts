import { pool } from '../connection';
import { v4 as uuidv4 } from 'uuid';

export interface Conversation {
  id: string;
  sessionId: string;
  userId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class ConversationRepository {
  async create(sessionId: string, userId?: string): Promise<Conversation> {
    const id = uuidv4();
    const query = `
      INSERT INTO "Conversation" (id, "sessionId", "userId", "createdAt", "updatedAt")
      VALUES ($1, $2, $3, NOW(), NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [id, sessionId, userId]);
    return result.rows[0];
  }

  async findBySessionId(sessionId: string): Promise<Conversation | null> {
    const query = `SELECT * FROM "Conversation" WHERE "sessionId" = $1`;
    const result = await pool.query(query, [sessionId]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<Conversation | null> {
    const query = `SELECT * FROM "Conversation" WHERE id = $1`;
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string): Promise<Conversation> {
    const query = `
      UPDATE "Conversation" 
      SET "updatedAt" = NOW() 
      WHERE id = $1 
      RETURNING *
    `;
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
}

export const conversationRepository = new ConversationRepository();
