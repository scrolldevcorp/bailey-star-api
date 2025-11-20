// src/agents/mcp/tools/searchProducts.tool.ts
import { z } from "zod";
import Database from "../../../infrastructure/db/database";
import { ProductRepository } from "../../../infrastructure/repositories/postgress-product.repository";
import { ProductService } from "../../../domain/services/product.service";
import { McpTool } from "../../types/mcp-tool.types";
import { formatProductSearchResults } from "../utils/product-list-formater.util";

export const searchProductsTool: McpTool = {
  name: "searchProducts",
  description: "Searches for products using keywords in description, code, or reference. Perfect for finding products when user describes what they need.",
  parameters: z.object({
    keywords: z.array(z.string()).min(1).describe("List of keywords to search in products (e.g., ['laptop', 'dell', '16gb'])"),
    limit: z.number().optional().default(10).describe("Maximum number of results to return (default: 10)"),
    minStock: z.number().optional().describe("Filter only products with stock greater than or equal to this value")
  }),
  execute: async (args: { keywords: string[]; limit?: number; minStock?: number }, extra?: any) => {
    const { logger } = extra || {};

    try {
      const database = Database.getInstance();
      const pool = database.getPool();
      const productRepository = new ProductRepository(pool);
      const productService = new ProductService(productRepository);

      logger?.info(`🔍 Buscando productos con keywords: ${args.keywords.join(', ')}`);

      const products = await productService.searchProducts(
        args.keywords,
        args.limit || 10,
        args.minStock
      );

      logger?.info(`✅ Encontrados ${products.length} productos`);

      // ⚠️ CAMBIO AQUÍ: Siempre retornar el mismo formato
      if (products.length === 0) {
        const message = `No se encontraron productos con las palabras clave: ${args.keywords.join(', ')}`;
        return message; // Retornar string directamente, igual que el caso exitoso
      }

      const mappedProducts = products.map(p => ({
        id: p.id,
        code: p.code,
        reference: p.reference,
        description: p.description,
        stock: p.stock,
        wholesale_price_bs: p.wholesale_price_bs,
        retail_price: p.retail_price,
        wholesale_price_usd: p.wholesale_price_usd,
        createdAt: p.created_at,
        updatedAt: p.updated_at
      }));

      const formattedText = formatProductSearchResults(mappedProducts);
      console.log(formattedText)
      return formattedText; // Ya estaba bien aquí

    } catch (error) {
      logger?.error('❌ Error buscando productos:', error);
      return `❌ Error buscando productos: ${error instanceof Error ? error.message : 'Error desconocido al buscar productos'}`;
    }
  }
};