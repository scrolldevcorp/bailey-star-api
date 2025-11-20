import { BaseTool } from '../../tools/base/BaseTool';
import { ToolCategory, ToolDefinition, ToolResult, ToolParameter } from '../../types/tool.types';
import mcpClient from '../client';

/**
 * Adaptador para herramientas MCP
 * Convierte herramientas MCP en herramientas del sistema local
 */
export class MCPToolAdapter extends BaseTool {
  private mcpToolName: string;

  constructor(mcpToolDefinition: { name: string; description?: string; parameters?: unknown[] }) {
    // Convertir definición MCP a definición local
    const localDefinition: ToolDefinition = {
      name: mcpToolDefinition.name,
      description: mcpToolDefinition.description || `Herramienta ${mcpToolDefinition.name}`,
      category: ToolCategory.MCP,
      parameters: (mcpToolDefinition.parameters || []) as ToolParameter[],
    };

    super(localDefinition);
    this.mcpToolName = mcpToolDefinition.name;
  }

  /**
   * Ejecutar herramienta MCP
   */
  async execute(params: Record<string, unknown>): Promise<ToolResult> {
    const startTime = Date.now();

    try {
      // Enviar solicitud al servidor MCP
      const result = await mcpClient.sendRequest('/execute', {
        tool: this.mcpToolName,
        parameters: params,
      });

      const executionTime = Date.now() - startTime;
      return this.createSuccessResult(result, executionTime);

    } catch (error) {
      const executionTime = Date.now() - startTime;
      return this.createErrorResult(error instanceof Error ? error.message : 'Error desconocido', executionTime);
    }
  }
}

/**
 * Cargar herramientas desde servidor MCP
 */
export async function loadMCPTools(): Promise<MCPToolAdapter[]> {
  try {
    const mcpTools = await mcpClient.getAvailableTools();
    return mcpTools.map(tool => new MCPToolAdapter(tool as { name: string; description?: string; parameters?: unknown[] }));
  } catch (error) {
    console.error('Error cargando herramientas MCP:', error);
    return [];
  }
}
