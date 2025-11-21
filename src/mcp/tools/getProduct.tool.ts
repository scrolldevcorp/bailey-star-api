import { z } from "zod";
import Database from "../../infrastructure/db/database";
import { ProductRepository } from "../../infrastructure/repositories/postgress-product.repository";
import { ProductService } from "../../domain/services/product.service";
import { McpTool } from "./mcp-tool.types";
import { encode } from "@toon-format/toon";

export const getProductTool: McpTool = {
  name: "getProduct",
  description: "Gets detailed information about a specific product by its code or reference number",
  annotations: {
    title: "Get product by code or reference",
    readOnlyHint: true
  },
  parameters: {
    code: z.string().optional().describe("Product code to search for"),
    reference: z.string().optional().describe("Product reference number to search for"),
  },
  execute: async (args: { code?: string; reference?: string }, extra?: any) => {
    const { logger } = extra || {};
    
    try {
      const database = Database.getInstance();
      const pool = database.getPool();
      const productRepository = new ProductRepository(pool);
      const productService = new ProductService(productRepository);

      // Validar que al menos uno esté presente
      if (!args.code && !args.reference) {
        return {
          success: false,
          error: 'Debe proporcionar al menos un código o referencia del producto'
        };
      }

      const identifier = {
        code: args.code,
        reference: args.reference
      };

      logger?.info(`🔍 Buscando producto con: ${args.code ? `code: ${args.code}` : `reference: ${args.reference}`}`);

      const product = await productService.getProductByIdentifier(identifier);

      return {
        content: [{
          type: "text",
          text: encode(product)
        }]
      };
    } catch (error) {
      logger?.error('❌ Error obteniendo producto:', error);
      return {
        content: [{
          type: "error",
          text: `Error obteniendo producto: ${error instanceof Error ? error.message : 'Error desconocido al obtener producto'}`
        }]
      };
    }
  }
};