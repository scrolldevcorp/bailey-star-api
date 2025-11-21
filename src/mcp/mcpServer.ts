import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ProductService } from '../domain/services/product.service';
import { getProductTool } from './tools/getProduct.tool';
import { searchProductsTool } from './tools/searchProducts.tool';
import { sendSaleEmailTool } from './tools/sendEmail.tool';


export function createMcpServer(productService: ProductService) {
  console.log('🚀 Inicializando MCP Server...');
  const mcpServer = new McpServer({
    name: "Flight Tools API",
    version: "1.0.0"
  });

  const tools = [
    getProductTool,
    searchProductsTool,
    sendSaleEmailTool,
  ];

  console.log(`🛠️ Registrando ${tools.length} herramientas...`);
  tools.forEach(tool => {
    console.log(`  • Registrando: ${tool.name}`);
    mcpServer.tool(
      tool.name,
      tool.description,
      tool.parameters,
      tool.annotations,
      tool.execute
    );
  });

  console.log(`✅ MCP Server inicializado con ${tools.length} herramientas`);
  return { mcpServer, tools };
}