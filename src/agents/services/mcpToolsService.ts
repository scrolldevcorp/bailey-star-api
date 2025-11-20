// src/agents/services/mcpToolsService.ts
import logger from "../../core/utils/logger";
import { loadMcpTools } from "../mcp/loaders";
import type OpenAI from "openai";
import { z } from "zod";
import { McpTool } from "../types/mcp-tool.types";

export class MCPToolsService {
  private toolsCache: McpTool[] = [];
  private lastFetch: number = 0;
  private cacheDuration = 60000;

  private loadTools(): McpTool[] {
    logger.info("🔄 Cargando herramientas MCP internas…");
    return loadMcpTools();
  }

  async getToolsForOpenAI(): Promise<OpenAI.Chat.Completions.ChatCompletionTool[]> {
    const now = Date.now();

    if (this.toolsCache.length > 0 && now - this.lastFetch < this.cacheDuration) {
      logger.info(`⚡ Usando cache de tools (${this.toolsCache.length})`);
      return this.toolsCache.map((t) => this.convertToOpenAI(t));
    }

    logger.info("🔍 Cargando tools desde MCP interno…");
    const tools = this.loadTools();

    this.toolsCache = tools;
    this.lastFetch = now;

    logger.info(`✅ ${tools.length} herramientas cargadas del MCP interno`);

    return tools.map((t) => this.convertToOpenAI(t));
  }

  /**
   * Convertir Zod schema a JSON Schema manualmente
   */
  private zodToJsonSchema(zodSchema: z.ZodObject<any>): Record<string, any> {
    const shape = zodSchema.shape;
    const properties: Record<string, any> = {};
    const required: string[] = [];

    for (const [key, value] of Object.entries(shape)) {
      const zodType = value as z.ZodTypeAny;
      
      // Extraer descripción si existe
      const description = zodType.description;
      
      // Determinar tipo básico
      let propertySchema: any = { type: "string" };
      
      if (zodType instanceof z.ZodString) {
        propertySchema = { type: "string" };
      } else if (zodType instanceof z.ZodNumber) {
        propertySchema = { type: "number" };
      } else if (zodType instanceof z.ZodBoolean) {
        propertySchema = { type: "boolean" };
      } else if (zodType instanceof z.ZodArray) {
        propertySchema = { type: "array", items: { type: "string" } };
      } else if (zodType instanceof z.ZodObject) {
        propertySchema = this.zodToJsonSchema(zodType);
      }
      
      if (description) {
        propertySchema.description = description;
      }
      
      properties[key] = propertySchema;
      
      // Si no es opcional, agregarlo a required
      if (!zodType.isOptional()) {
        required.push(key);
      }
    }

    return {
      type: "object",
      properties,
      required: required.length > 0 ? required : undefined
    };
  }

  private convertToOpenAI(tool: McpTool): OpenAI.Chat.Completions.ChatCompletionTool {
    const jsonSchema = this.zodToJsonSchema(tool.parameters);

    return {
      type: "function",
      function: {
        name: tool.name,
        description: tool.description,
        parameters: jsonSchema
      }
    };
  }

  async executeTool(toolName: string, args: Record<string, any>) {
    logger.info(`🔧 Ejecutando tool MCP: ${toolName}`);

    let tool = this.toolsCache.find((t) => t.name === toolName);
    
    if (!tool) {
      const allTools = this.loadTools();
      tool = allTools.find((t) => t.name === toolName);
    }

    if (!tool) {
      logger.error(`❌ Tool "${toolName}" no encontrada`);
      return {
        success: false,
        error: `Tool "${toolName}" no existe en MCP`
      };
    }

    try {
      // Validar con Zod
      const validatedArgs = tool.parameters.parse(args);
      
      const result = await tool.execute(validatedArgs, { logger });

      logger.info(`✅ Tool ${toolName} ejecutada correctamente`);

      return result;
    } catch (error) {
      logger.error(`❌ Error ejecutando tool ${toolName}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Error desconocido",
        toolName
      };
    }
  }

  async getAvailableToolNames(): Promise<string[]> {
    if (this.toolsCache.length === 0) {
      this.toolsCache = this.loadTools();
    }
    return this.toolsCache.map(t => t.name);
  }

  clearCache() {
    this.toolsCache = [];
    this.lastFetch = 0;
    logger.info("🗑️ Cache de MCP tools limpiado");
  }
}

export const mcpToolsService = new MCPToolsService();