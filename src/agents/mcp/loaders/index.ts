// src/agents/mcp/loaders.ts

import { McpTool } from "../../types/mcp-tool.types";
import { getProductTool } from "../tools/getProduct.tool";
import { searchProductsTool } from "../tools/searchProducts.tool";


export function loadMcpTools(): McpTool[] {
  return [
    getProductTool,
    searchProductsTool,  // Tool de búsqueda por keywords

    // ...otras tools
  ];
}