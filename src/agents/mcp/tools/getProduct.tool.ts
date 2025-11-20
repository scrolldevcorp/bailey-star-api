import { z } from "zod";
import Database from "../../../infrastructure/db/database";
import { ProductRepository } from "../../../infrastructure/repositories/postgress-product.repository";
import { ProductService } from "../../../domain/services/product.service";
import { McpTool } from "../../types/mcp-tool.types";

export const getProductTool: McpTool = {
  name: "getProduct",
  description: "Gets detailed information about a specific product by its code or reference number",
  parameters: z.object({
    code: z.string().optional().describe("Product code to search for"),
    reference: z.string().optional().describe("Product reference number to search for"),
  }),
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
        success: true,
        product: {
          id: product.id,
          code: product.code,
          reference: product.reference,
          description: product.description,
          stock: product.stock,
          prices: {
            wholesaleBs: product.wholesale_price_bs,
            retail: product.retail_price,
            wholesaleUsd: product.wholesale_price_usd
          },
          createdAt: product.created_at,
          updatedAt: product.updated_at
        }
      };

    } catch (error) {
      logger?.error('❌ Error obteniendo producto:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Producto no encontrado'
      };
    }
  }
};