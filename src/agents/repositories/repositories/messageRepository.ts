import { pool } from '../connection';

export interface Message {
  id: number;
  session_id: string;
  message: {
    type: string;
    content: string;
    additional_kwargs?: Record<string, unknown>;
    response_metadata?: Record<string, unknown>;
  };
  created_at: Date;
}

export class MessageRepository {
  async create(sessionId: string, messageData: Message['message']): Promise<Message> {
    const query = `
      INSERT INTO chat_messages (session_id, message, created_at)
      VALUES ($1, $2, NOW())
      RETURNING *
    `;
    
    const result = await pool.query(query, [sessionId, JSON.stringify(messageData)]);
    return result.rows[0];
  }

  async findBySessionId(sessionId: string, limit = 100): Promise<Message[]> {
    const query = `
      SELECT * FROM chat_messages 
      WHERE session_id = $1 
      ORDER BY created_at ASC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [sessionId, limit]);
    return result.rows;
  }

  async findRecent(sessionId: string, limit = 10): Promise<Message[]> {
    const query = `
      SELECT * FROM chat_messages 
      WHERE session_id = $1 
      ORDER BY created_at DESC
      LIMIT $2
    `;
    
    const result = await pool.query(query, [sessionId, limit]);
    return result.rows.reverse(); // Invertir para orden cronológico
  }

  async deleteBySessionId(sessionId: string): Promise<void> {
    const query = `DELETE FROM chat_messages WHERE session_id = $1`;
    await pool.query(query, [sessionId]);
  }
}

export const messageRepository = new MessageRepository();
