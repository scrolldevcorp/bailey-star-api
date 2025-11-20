import { BaseAgent } from './base/BaseAgent';
import { AgentType, AgentStatus, AgentContext, AgentResponse } from './types/agent.types';
import { MCPToolsService, mcpToolsService } from './services/mcpToolsService';

import type OpenAI from 'openai';
import logger from '../core/utils/logger';

/**
 * Agente especializado en búsqueda y reserva de vuelos
 * Soporta GPT-4o-mini y GPT-5-mini con MCP Tools
 * Diseñado para trabajar directamente sin orchestrator
 */
export class SalesAgent extends BaseAgent {
  private mcpToolsAvailable: string[] = [];
  private mcpToolsService: MCPToolsService;

  constructor() {
    super({
      type: AgentType.SALES,
      model: 'deepseek-chat',
    });
    
    // Inicializar el servicio
    this.mcpToolsService = mcpToolsService;
    
    // Cargar tools disponibles (async en constructor, se maneja en execute)
    this.initializeMCPTools();
    
    logger.info(`✅  SalesAgent | Modelo: ${this.config.model}`);
  }

  /**
   * Inicializar herramientas MCP disponibles
   */
  private async initializeMCPTools(): Promise<void> {
    try {
      this.mcpToolsAvailable = await this.mcpToolsService.getAvailableToolNames();
      logger.info(`🛠️ MCP Tools disponibles: ${this.mcpToolsAvailable.join(', ')}`);
    } catch (error) {
      logger.error('❌ Error inicializando MCP tools:', error);
      this.mcpToolsAvailable = [];
    }
  }

  /**
   * Type guard para verificar si es un tool call estándar
   */
  private isStandardToolCall(toolCall: any): toolCall is { id: string; type: 'function'; function: { name: string; arguments: string } } {
    return toolCall && typeof toolCall === 'object' && 'function' in toolCall && toolCall.function && typeof toolCall.function.name === 'string';
  }

  /**
   * Ejecutar operaciones de vuelo con GPT-4o-mini o GPT-5-mini
   * Maneja todo el flujo de conversación y ejecución de MCP tools
   */
  async execute(input: string, context: AgentContext): Promise<AgentResponse> {
    try {
      this.updateStatus(AgentStatus.THINKING);

      // Obtener historial de mensajes del contexto
      const conversationHistory = (context.metadata?.messages || []) as any[];
      logger.info(`Historial: ${conversationHistory.length} mensajes totales`);
      
      // Construir mensajes para la IA
      const messages: any[] = [
        {
          role: 'system',
          content: `You are an expert sales assistant. Always respond in Spanish, be concise and conversational.

AVAILABLE TOOLS:

searchProducts: Use when the user describes what they're looking for (e.g., "I need a laptop", "looking for a mechanical keyboard"). Extract relevant keywords from the user's description.

getProduct: Use when you have a specific product code or reference number and need detailed information.

GUIDELINES:

When the user asks about products, use searchProducts with relevant keywords

Present results clearly and naturally

If multiple products are found, highlight the most relevant ones

If no products are found, suggest alternatives or ask for more details

Keep responses SHORT and to the point

DO NOT repeat or rephrase the user's question

Be direct and avoid redundancy

When calling a tool, you must return the tool result EXACTLY as the tool provides it, without modifying, restructuring, summarizing, interpreting, or altering any data.

When displaying a product name or description to the user, rewrite ONLY the visible text to make it clearer and easier to understand.

If the product name contains weird codes, prefixes, suffixes, or internal identifiers, remove them unless they correspond to size, dimensions, or measurements.

If the product is an adult/sexual item, lightly censor the name by obfuscating part of the sensitive word (e.g., "M4sturb4d0r"). Keep it readable but discreet.

Never modify, filter, or alter the raw data returned by the tool—only adjust how you present the product name to the user.`
        } as OpenAI.Chat.Completions.ChatCompletionSystemMessageParam,
        ...(Array.isArray(conversationHistory) ? conversationHistory.slice(-20) : []).map((msg) => ({
          role: msg.role as 'user' | 'assistant' | 'system',
          content: msg.content,
        })),
        {
          role: 'user',
          content: input,
        },
      ];

      this.updateStatus(AgentStatus.EXECUTING);

      // Obtener herramientas MCP disponibles
      const mcpTools = await mcpToolsService.getToolsForOpenAI();
      logger.info(`🛠️ MCP tools: ${mcpTools.length}`);

      // Preparar parámetros de la llamada
      const completionParams: {
        messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
        temperature?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        topP?: number;
        tools?: OpenAI.Chat.Completions.ChatCompletionTool[];
        tool_choice?: 'auto' | 'none' | 'required';
      } = {
        messages,
        temperature: this.config.temperature,
        frequencyPenalty: this.config.frequencyPenalty,
        presencePenalty: this.config.presencePenalty,
        topP: this.config.topP,
      };

      // GPT-4o-mini y GPT-5-mini SOPORTAN tools nativamente
      if (mcpTools.length > 0) {
        completionParams.tools = mcpTools as any[];
        completionParams.tool_choice = 'auto';
      } else {
        logger.warn('⚠️ Sin MCP tools');
      }

      // Log inicial
      logger.info(`📨 ${this.config.model} | Msgs: ${messages.length} | Tools: ${mcpTools.length} | Input: "${input.substring(0, 80)}..."`);
      
      // Generar respuesta inicial
      let aiMessage = await this.aiService.generateChatCompletion(completionParams);
      
      // Log de respuesta
      const hasContent = !!aiMessage.content;
      const toolCalls = aiMessage.tool_calls?.length || 0;
      logger.info(`📥 Respuesta | Contenido: ${hasContent} | Tools: ${toolCalls}${hasContent ? ` | "${aiMessage.content?.substring(0, 100)}..."` : ''}`);

      const toolsUsed: string[] = [];
      
      // Tracking detallado de tokens por iteración
      const tokenBreakdown: Array<{
        step: string;
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
      }> = [];
      
      // Tracking de tokens totales
      let totalPromptTokens = aiMessage.usage?.prompt_tokens || 0;
      let totalCompletionTokens = aiMessage.usage?.completion_tokens || 0;
      
      // Registrar primera llamada
      tokenBreakdown.push({
        step: 'Initial request',
        promptTokens: aiMessage.usage?.prompt_tokens || 0,
        completionTokens: aiMessage.usage?.completion_tokens || 0,
        totalTokens: (aiMessage.usage?.prompt_tokens || 0) + (aiMessage.usage?.completion_tokens || 0)
      });

      // MANEJO DE MÚLTIPLES TOOL CALLS EN SECUENCIA
      let iteration = 0;
      const maxIterations = 10; // Prevenir loops infinitos
      
      // Array temporal para tool calls (NO se guarda en historial persistente)
      const tempToolMessages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [];

      while (aiMessage.tool_calls && aiMessage.tool_calls.length > 0 && iteration < maxIterations) {
        iteration++;
        
        // Filtrar solo los tool calls estándar que tienen la propiedad 'function'
        const standardToolCalls = aiMessage.tool_calls.filter(this.isStandardToolCall);
        
        if (standardToolCalls.length === 0) {
          logger.warn('⚠️ No hay tool calls estándar en esta iteración');
          break;
        }
        
        // Extraer nombres de tools
        const toolNames = standardToolCalls.map(tc => tc.function.name).join(', ');
        
        logger.info(`🔄 Iteración ${iteration}/${maxIterations} | Tools: ${toolNames}`);
        
        // Agregar mensaje del asistente con tool_calls al array TEMPORAL
        tempToolMessages.push({
          role: 'assistant',
          content: aiMessage.content || null,
          tool_calls: standardToolCalls as any[]
        } as any);

        // Ejecutar cada tool call de esta ronda
        for (const toolCall of standardToolCalls) {
          const toolName = toolCall.function.name;
          let toolArgs;
          
          try {
            toolArgs = JSON.parse(toolCall.function.arguments);
          } catch (parseError) {
            logger.error(`❌ Error parseando argumentos de ${toolName}:`, parseError);
            tempToolMessages.push({
              role: 'tool',
              content: JSON.stringify({ error: 'Invalid JSON arguments' }),
              tool_call_id: toolCall.id
            } as any);
            continue;
          }
          
          logger.info(`🔨 ${toolName} | Args: ${JSON.stringify(toolArgs).substring(0, 150)}...`);
          
          try {
            const toolResult = await mcpToolsService.executeTool(toolName, toolArgs);
            toolsUsed.push(`${toolName} (MCP)`);
            
            // Log del resultado
            const resultPreview = JSON.stringify(toolResult).substring(0, 200);
            logger.info(`📦 ${toolName} resultado: ${resultPreview}${JSON.stringify(toolResult).length > 200 ? '...' : ''}`);
            
            // Agregar resultado al historial
            const toolResultString = JSON.stringify(toolResult);
            
            // Limitar el tamaño del resultado enviado al LLM
            let truncatedResult = toolResultString;
            const MAX_TOOL_RESULT_LENGTH = 5000; // Máximo 5000 caracteres
            
            if (toolResultString.length > MAX_TOOL_RESULT_LENGTH) {
              truncatedResult = toolResultString.substring(0, MAX_TOOL_RESULT_LENGTH) + '... [resultado truncado]';
              logger.info(`⚠️ Resultado de ${toolName} truncado: ${toolResultString.length} → ${MAX_TOOL_RESULT_LENGTH} chars`);
            }
            
            tempToolMessages.push({
              role: 'tool',
              content: truncatedResult,
              tool_call_id: toolCall.id
            } as any);
            
            logger.info(`✅ ${toolName} OK (${truncatedResult.length} chars)`);
          } catch (error) {
            logger.error(`❌ Error ejecutando MCP tool ${toolName}:`, error);
            tempToolMessages.push({
              role: 'tool',
              content: JSON.stringify({ 
                error: error instanceof Error ? error.message : 'Error desconocido',
                tool: toolName
              }),
              tool_call_id: toolCall.id
            } as any);
          }
        }

        // Generar siguiente respuesta MANTENIENDO las tools habilitadas
        logger.info(`🔄 Siguiente respuesta | Msgs: ${messages.length} + ${tempToolMessages.length} tools`);
        
        // Combinar mensajes base + mensajes temporales de tools
        const messagesWithTools = [...messages, ...tempToolMessages];
        
        const nextResponse = await this.aiService.generateChatCompletion({
          messages: messagesWithTools,
          temperature: this.config.temperature,
          tools: mcpTools as OpenAI.Chat.Completions.ChatCompletionTool[],
          tool_choice: 'auto'
        });
        
        // Acumular tokens
        const iterationPromptTokens = nextResponse.usage?.prompt_tokens || 0;
        const iterationCompletionTokens = nextResponse.usage?.completion_tokens || 0;
        
        totalPromptTokens += iterationPromptTokens;
        totalCompletionTokens += iterationCompletionTokens;
        
        // Registrar tokens de esta iteración
        tokenBreakdown.push({
          step: `Tool iteration ${iteration} (${toolNames})`,
          promptTokens: iterationPromptTokens,
          completionTokens: iterationCompletionTokens,
          totalTokens: iterationPromptTokens + iterationCompletionTokens
        });
        
        aiMessage = nextResponse;
      }

      // Log final del loop
      if (iteration > 0) {
        logger.info(`✅ Loop completado | ${iteration} iteraciones | ${toolsUsed.length} tools`);
      }

      // Limpiar la respuesta final
      let finalMessage = aiMessage.content || '';
      
      // Limpiar marcadores técnicos
      const rawLength = finalMessage.length;
      finalMessage = this.cleanTechnicalMarkers(finalMessage);
      if (rawLength !== finalMessage.length) {
        logger.info(`🧹 Limpieza aplicada | ${rawLength} → ${finalMessage.length} chars`);
      }
      
      if (!finalMessage && toolsUsed.length > 0) {
        finalMessage = 'Procesando tu solicitud...';
        logger.warn('⚠️ Respuesta vacía después de tool_calls');
      } else if (!finalMessage) {
        finalMessage = 'No recibí respuesta del modelo. Por favor intenta de nuevo.';
        logger.error('❌ Respuesta completamente vacía del modelo');
      }

      const response: AgentResponse = {
        success: true,
        message: finalMessage,
        data: null,
        toolsUsed,
        usage: {
          promptTokens: totalPromptTokens,
          completionTokens: totalCompletionTokens,
          totalTokens: totalPromptTokens + totalCompletionTokens,
          breakdown: tokenBreakdown
        }
      };

      this.updateStatus(AgentStatus.IDLE);
      logger.info(`✅ FlightAgent completado`);
      if (response.usage) {
        logger.info(`📊 Tokens | Total: ${response.usage.totalTokens} (In: ${response.usage.promptTokens} + Out: ${response.usage.completionTokens})`);
        
        if (response.usage.breakdown && response.usage.breakdown.length > 0) {
          logger.info(`📋 Breakdown:`);
          response.usage.breakdown.forEach((item, index) => {
            logger.info(`   ${index + 1}. ${item.step} | In: ${item.promptTokens} Out: ${item.completionTokens} Total: ${item.totalTokens}`);
          });
        }
      }
      if (toolsUsed.length > 0) {
        logger.info(`🛠️ Tools: ${toolsUsed.join(', ')}`);
      }
      
      return response;

    } catch (error) {
      logger.error('❌ Error en FlightAgent:', error);
      return this.handleError(error);
    }
  }

  /**
   * Limpiar marcadores técnicos de la respuesta
   */
  private cleanTechnicalMarkers(content: string): string {
    if (!content) return content;
    
    let cleaned = content;
    
    // Remover marcadores técnicos de DeepSeek para tool calls
    cleaned = cleaned.replace(/<｜tool▁calls▁begin｜>.*?<｜tool▁calls▁end｜>/gs, '');
    cleaned = cleaned.replace(/<\|tool_calls_begin\|>.*?<\|tool_calls_end\|>/gs, '');
    cleaned = cleaned.replace(/<｜tool▁call▁begin｜>.*?<｜tool▁call▁end｜>/gs, '');
    cleaned = cleaned.replace(/<\|tool_call_begin\|>.*?<\|tool_call_end\|>/gs, '');
    cleaned = cleaned.replace(/<｜tool▁sep｜>/g, '');
    cleaned = cleaned.replace(/<\|tool_sep\|>/g, '');
    
    // Remover menciones de nombres de funciones entre corchetes
    cleaned = cleaned.replace(/\[\s*(searchProducts|getProduct)\s*[^\]]*\]/gi, '');
    
    // Remover frases técnicas
    cleaned = cleaned.replace(/\b(ejecutando|llamando a|usando|utilizando)\s+(función|tool|herramienta)\s+\w+/gi, '');
    
    // Limpiar múltiples líneas en blanco
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    return cleaned.trim();
  }
}