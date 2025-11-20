import { Pool, QueryResult } from 'pg';
import {
  CreateProductDTO,
  Product,
  ProductFilters,
  ProductIdentifier,
  UpdateProductDTO,
} from '../../domain/entities/product.entity';
import type { ProductRepository as IProductRepository } from '../../domain/repositories/product.repository';
import { DatabaseError } from '../../core/utils/api-error';

/**
 * Repositorio para operaciones de base de datos de productos (implementación Postgres)
 */
export class ProductRepository implements IProductRepository {
  constructor(private pool: Pool) {}

  /**
   * Crear un nuevo producto
   */
  async create(productData: CreateProductDTO): Promise<Product> {
    const query = `
      INSERT INTO products (
        code, reference, description, stock,
        wholesale_price_bs, retail_price, wholesale_price_usd
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const values = [
      productData.code || null,
      productData.reference,
      productData.description,
      productData.stock,
      productData.wholesale_price_bs,
      productData.retail_price,
      productData.wholesale_price_usd,
    ];

    try {
      const result: QueryResult<Product> = await this.pool.query(query, values);
      return result.rows[0];
    } catch (error: any) {
      throw new DatabaseError('Error al crear el producto', { original: error.message });
    }
  }

  /**
   * Buscar producto por identificador (código o referencia)
   */
  async findByIdentifier(identifier: ProductIdentifier): Promise<Product | null> {
    if (!identifier.code && !identifier.reference) {
      return null;
    }

    let query = 'SELECT * FROM products WHERE ';
    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (identifier.code) {
      conditions.push(`code = $${paramIndex}`);
      values.push(identifier.code);
      paramIndex++;
    }

    if (identifier.reference) {
      conditions.push(`reference = $${paramIndex}`);
      values.push(identifier.reference);
      paramIndex++;
    }

    query += conditions.join(' OR ');

    try {
      const result: QueryResult<Product> = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError('Error al buscar el producto', { original: error.message });
    }
  }

  /**
   * Buscar producto por ID (UUID)
   */
  async findById(id: string): Promise<Product | null> {
    const query = 'SELECT * FROM products WHERE id = $1';

    try {
      const result: QueryResult<Product> = await this.pool.query(query, [id]);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError('Error al buscar el producto', { original: error.message });
    }
  }

  /**
   * Buscar todos los productos con filtros opcionales
   */
  async findAll(filters?: ProductFilters): Promise<Product[]> {
    let query = 'SELECT * FROM products WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.code) {
        query += ` AND code = $${paramIndex}`;
        values.push(filters.code);
        paramIndex++;
      }

      if (filters.reference) {
        query += ` AND reference ILIKE $${paramIndex}`;
        values.push(`%${filters.reference}%`);
        paramIndex++;
      }

      if (filters.description) {
        query += ` AND description ILIKE $${paramIndex}`;
        values.push(`%${filters.description}%`);
        paramIndex++;
      }

      if (filters.minStock !== undefined) {
        query += ` AND stock >= $${paramIndex}`;
        values.push(filters.minStock);
        paramIndex++;
      }

      if (filters.maxStock !== undefined) {
        query += ` AND stock <= $${paramIndex}`;
        values.push(filters.maxStock);
        paramIndex++;
      }

      if (filters.minPrice !== undefined) {
        query += ` AND (wholesale_price_bs >= $${paramIndex} OR retail_price >= $${paramIndex} OR wholesale_price_usd >= $${paramIndex})`;
        values.push(filters.minPrice);
        paramIndex++;
      }

      if (filters.maxPrice !== undefined) {
        query += ` AND (wholesale_price_bs <= $${paramIndex} OR retail_price <= $${paramIndex} OR wholesale_price_usd <= $${paramIndex})`;
        values.push(filters.maxPrice);
        paramIndex++;
      }
    }

    query += ' ORDER BY created_at DESC';

    if (filters?.limit) {
      query += ` LIMIT $${paramIndex}`;
      values.push(filters.limit);
      paramIndex++;
    }

    if (filters?.offset) {
      query += ` OFFSET $${paramIndex}`;
      values.push(filters.offset);
    }

    try {
      const result: QueryResult<Product> = await this.pool.query(query, values);
      return result.rows;
    } catch (error: any) {
      throw new DatabaseError('Error al listar productos', { original: error.message });
    }
  }

  /**
   * Contar productos con filtros opcionales
   */
  async count(filters?: ProductFilters): Promise<number> {
    let query = 'SELECT COUNT(*) as total FROM products WHERE 1=1';
    const values: any[] = [];
    let paramIndex = 1;

    if (filters) {
      if (filters.code) {
        query += ` AND code = $${paramIndex}`;
        values.push(filters.code);
        paramIndex++;
      }

      if (filters.reference) {
        query += ` AND reference ILIKE $${paramIndex}`;
        values.push(`%${filters.reference}%`);
        paramIndex++;
      }

      if (filters.description) {
        query += ` AND description ILIKE $${paramIndex}`;
        values.push(`%${filters.description}%`);
        paramIndex++;
      }

      if (filters.minStock !== undefined) {
        query += ` AND stock >= $${paramIndex}`;
        values.push(filters.minStock);
        paramIndex++;
      }

      if (filters.maxStock !== undefined) {
        query += ` AND stock <= $${paramIndex}`;
        values.push(filters.maxStock);
        paramIndex++;
      }
    }

    try {
      const result = await this.pool.query(query, values);
      return parseInt(result.rows[0].total, 10);
    } catch (error: any) {
      throw new DatabaseError('Error al contar productos', { original: error.message });
    }
  }

  /**
   * Actualizar producto por identificador
   */
  async update(identifier: ProductIdentifier, updateData: UpdateProductDTO): Promise<Product | null> {
    if (!identifier.code && !identifier.reference) {
      return null;
    }

    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    // Construir campos a actualizar
    if (updateData.code !== undefined) {
      updates.push(`code = $${paramIndex}`);
      values.push(updateData.code);
      paramIndex++;
    }

    if (updateData.reference !== undefined) {
      updates.push(`reference = $${paramIndex}`);
      values.push(updateData.reference);
      paramIndex++;
    }

    if (updateData.description !== undefined) {
      updates.push(`description = $${paramIndex}`);
      values.push(updateData.description);
      paramIndex++;
    }

    if (updateData.stock !== undefined) {
      updates.push(`stock = $${paramIndex}`);
      values.push(updateData.stock);
      paramIndex++;
    }

    if (updateData.wholesale_price_bs !== undefined) {
      updates.push(`wholesale_price_bs = $${paramIndex}`);
      values.push(updateData.wholesale_price_bs);
      paramIndex++;
    }

    if (updateData.retail_price !== undefined) {
      updates.push(`retail_price = $${paramIndex}`);
      values.push(updateData.retail_price);
      paramIndex++;
    }

    if (updateData.wholesale_price_usd !== undefined) {
      updates.push(`wholesale_price_usd = $${paramIndex}`);
      values.push(updateData.wholesale_price_usd);
      paramIndex++;
    }

    if (updates.length === 0) {
      return null;
    }

    updates.push(`updated_at = NOW()`);

    // Construir condición WHERE
    const conditions: string[] = [];
    if (identifier.code) {
      conditions.push(`code = $${paramIndex}`);
      values.push(identifier.code);
      paramIndex++;
    }

    if (identifier.reference) {
      conditions.push(`reference = $${paramIndex}`);
      values.push(identifier.reference);
      paramIndex++;
    }

    const query = `
      UPDATE products
      SET ${updates.join(', ')}
      WHERE ${conditions.join(' OR ')}
      RETURNING *
    `;

    try {
      const result: QueryResult<Product> = await this.pool.query(query, values);
      return result.rows[0] || null;
    } catch (error: any) {
      throw new DatabaseError('Error al actualizar el producto', { original: error.message });
    }
  }

  /**
   * Eliminar producto por identificador
   */
  async delete(identifier: ProductIdentifier): Promise<boolean> {
    if (!identifier.code && !identifier.reference) {
      return false;
    }

    const conditions: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (identifier.code) {
      conditions.push(`code = $${paramIndex}`);
      values.push(identifier.code);
      paramIndex++;
    }

    if (identifier.reference) {
      conditions.push(`reference = $${paramIndex}`);
      values.push(identifier.reference);
      paramIndex++;
    }

    const query = `DELETE FROM products WHERE ${conditions.join(' OR ')} RETURNING id`;

    try {
      const result = await this.pool.query(query, values);
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error: any) {
      throw new DatabaseError('Error al eliminar el producto', { original: error.message });
    }
  }

  /**
   * Verificar si existe un producto con el código dado
   */
  async existsByCode(code: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM products WHERE code = $1) as exists';
    try {
      const result = await this.pool.query(query, [code]);
      return result.rows[0].exists;
    } catch (error: any) {
      throw new DatabaseError('Error al verificar código', { original: error.message });
    }
  }

  /**
   * Verificar si existe un producto con la referencia dada
   */
  async existsByReference(reference: string): Promise<boolean> {
    const query = 'SELECT EXISTS(SELECT 1 FROM products WHERE reference = $1) as exists';
    try {
      const result = await this.pool.query(query, [reference]);
      return result.rows[0].exists;
    } catch (error: any) {
      throw new DatabaseError('Error al verificar referencia', { original: error.message });
    }
  }

  async searchByKeywords(keywords: string[], limit: number = 10, minStock?: number): Promise<Product[]> {
  // Construir condiciones de búsqueda para cada palabra clave
  const keywordConditions = keywords.map((_, index) => {
    const paramIndex = index + 1;
    return `(
      description ILIKE $${paramIndex} OR 
      reference ILIKE $${paramIndex} OR 
      code ILIKE $${paramIndex}
    )`;
  }).join(' OR ');

  let query = `
    SELECT * FROM products 
    WHERE ${keywordConditions}
  `;

  const values: any[] = keywords.map(keyword => `%${keyword}%`);
  let paramIndex = keywords.length + 1;

  // Filtro opcional de stock mínimo
  if (minStock !== undefined) {
    query += ` AND stock >= $${paramIndex}`;
    values.push(minStock);
    paramIndex++;
  }

  query += ` ORDER BY 
    CASE 
      WHEN description ILIKE $1 THEN 1
      WHEN reference ILIKE $1 THEN 2
      WHEN code ILIKE $1 THEN 3
      ELSE 4
    END,
    stock DESC
    LIMIT $${paramIndex}
  `;
  
  values.push(limit);

  try {
    const result: QueryResult<Product> = await this.pool.query(query, values);
    return result.rows;
  } catch (error: any) {
    throw new DatabaseError('Error al buscar productos', { original: error.message });
  }
}
}
