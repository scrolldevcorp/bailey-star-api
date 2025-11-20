import OpenAI from 'openai';
import config from '../../core/config/environment';
import logger from '../../core/utils/logger';

export interface ChatCompletionParams {
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  topP?: number;
  tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
  tool_choice?: 'auto' | 'none' | 'required';
}

/**
 * Servicio de IA para OpenAI
 * Soporta GPT-4o-mini y GPT-5-mini con function calling completo
 */
export class AIService {
  private client: OpenAI;
  private model: string;

  constructor() {
    this.model = config.deepseek.model;

    // Inicializar cliente OpenAI
    this.client = new OpenAI({
      apiKey: config.deepseek.apiKey,
      baseURL: config.deepseek.baseUrl,
    });

    logger.info(`✅ DeepSeek AI Service inicializado con modelo: ${this.model}`);
    this.logModelCapabilities();
  }

  /**
   * Log de capacidades del modelo seleccionado
   */
  private logModelCapabilities(): void {
    logger.info(`✅ Modelo: ${this.model}`);
  }

  /**
   * Generar respuesta de chat con soporte completo para OpenAI/DeepSeek
   * Incluye retry logic para manejar errores intermitentes (404, 429, 500)
   */
  async generateChatCompletion(params: ChatCompletionParams) {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 segundos
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Preparar parámetros base
        const requestParams: OpenAI.Chat.Completions.ChatCompletionCreateParamsNonStreaming = {
          model: this.model,
          messages: params.messages,
          // max_tokens: params.maxTokens ?? 4000,
        };

        // Parámetros de sampling (todos soportados por GPT-4o-mini)
        if (params.temperature !== undefined) {
          requestParams.temperature = params.temperature;
        }
        if (params.frequencyPenalty !== undefined) {
          requestParams.frequency_penalty = params.frequencyPenalty;
        }
        if (params.presencePenalty !== undefined) {
          requestParams.presence_penalty = params.presencePenalty;
        }
        if (params.topP !== undefined) {
          requestParams.top_p = params.topP;
        }

        // Function calling / Tools
        if (params.tools && params.tools.length > 0) {
          requestParams.tools = params.tools;
          requestParams.tool_choice = params.tool_choice || 'auto';
          logger.info(`✅ ${params.tools.length} tools configuradas`);
        }

        // Realizar llamada a la API
        logger.info(`🚀 Llamando a API (${this.model})${attempt > 1 ? ` - Intento ${attempt}/${maxRetries}` : ''}...`);
        const response = await this.client.chat.completions.create(requestParams);

        const message = response.choices[0]?.message;
        const usage = response.usage;
        
        // Log de usage
        logger.info(`✅ Respuesta recibida (${this.model})`);
        logger.info(`📊 Token Usage - Total: ${usage?.total_tokens || 0} | Prompt: ${usage?.prompt_tokens || 0} | Completion: ${usage?.completion_tokens || 0}`);
        
        // Validación de respuesta
        if (!message?.content && !message?.tool_calls) {
          logger.warn('⚠️ Respuesta vacía del modelo');
          logger.debug('Message:', JSON.stringify(message, null, 2));
        }
        
        // Retornar mensaje con usage
        return {
          ...message,
          usage: usage
        };

      } catch (error: any) {
        const isRetryable = error?.status === 404 || error?.status === 429 || error?.status === 500 || error?.status === 502 || error?.status === 503;
        const isLastAttempt = attempt === maxRetries;
        
        // Log detallado del error
        if (error?.status === 404) {
          logger.error(`🔍 Error 404 Details:`, {
            status: error?.status,
            message: error?.message,
            url: error?.url || 'N/A',
            model: this.model,
            baseURL: config.deepseek.baseUrl
          });
        }
        
        if (isRetryable && !isLastAttempt) {
          // Calcular delay con exponential backoff
          const delay = baseDelay * Math.pow(2, attempt - 1);
          logger.warn(`⚠️ Error ${error?.status} (${this.model}) - Reintentando en ${delay}ms... (${attempt}/${maxRetries})`);
          
          // Esperar antes de reintentar
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        // Si no es retryable o es el último intento, lanzar error
        logger.error(`❌ Error generando respuesta (${this.model}):`, error);
        
        // Log adicional para debugging
        if (error instanceof Error) {
          logger.error('Error message:', error.message);
          logger.error('Error stack:', error.stack);
        }
        
        throw new Error(`Error en API: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      }
    }
    
    // Fallback (nunca debería llegar aquí)
    throw new Error('Max retries reached');
  }


  getModelInfo(): { provider: string; model: string; supportsTools: boolean } {
    return {
      provider: 'deepseek',
      model: this.model,
      supportsTools: this.model === 'deepseek-chat', // Solo deepseek-chat soporta tools
    };
  }

  /**
   * Cambiar modelo (para casos específicos)
   */
  switchModel(model: 'deepseek-chat' | 'deepseek-reasoner'): void {
    logger.info(`🔄 Cambiando modelo: ${this.model} → ${model}`);
    this.model = model;
    this.logModelCapabilities();
  }
}

// Exportar instancia singleton
export const aiService = new AIService();