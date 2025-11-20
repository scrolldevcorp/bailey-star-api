/**
 * Tipos de datos para productos del inventario
 */

export interface Product {
  id: string; // UUID
  code: string | null; // Código puede ser null y repetirse
  reference: string; // Referencia siempre requerida, puede repetirse
  description: string;
  stock: number;
  wholesale_price_bs: number; // Precio al mayor en bolívares (Precio 1)
  retail_price: number; // Precio al detal (Precio 2)
  wholesale_price_usd: number; // Precio al mayor en divisas (Precio 3)
  created_at: Date;
  updated_at: Date;
}

export interface CreateProductDTO {
  code?: string | null;
  reference: string;
  description: string;
  stock: number;
  wholesale_price_bs: number;
  retail_price: number;
  wholesale_price_usd: number;
}

export interface UpdateProductDTO {
  code?: string | null;
  reference?: string;
  description?: string;
  stock?: number;
  wholesale_price_bs?: number;
  retail_price?: number;
  wholesale_price_usd?: number;
}

export interface ProductIdentifier {
  code?: string;
  reference?: string;
}

export interface ProductFilters {
  code?: string;
  reference?: string;
  description?: string;
  minStock?: number;
  maxStock?: number;
  minPrice?: number;
  maxPrice?: number;
  limit?: number;
  offset?: number;
}

export interface SearchProductsDTO {
  keywords: string[]; // Palabras clave para buscar
  limit?: number;
  minStock?: number; // Opcional: filtrar por stock mínimo
}