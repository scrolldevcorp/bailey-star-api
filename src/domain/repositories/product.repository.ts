import {
  Product,
  CreateProductDTO,
  UpdateProductDTO,
  ProductIdentifier,
  ProductFilters,
} from '../entities/product.entity';

/**
 * Contrato de repositorio de dominio para productos
 *
 * Esta interfaz define las operaciones necesarias para que
 * cualquier implementación de almacenamiento (Postgres, memoria, etc.)
 * pueda ser utilizada por el dominio sin depender de detalles técnicos.
 */
export interface ProductRepository {
  /** Crear un nuevo producto */
  create(productData: CreateProductDTO): Promise<Product>;

  /** Buscar producto por identificador (código o referencia) */
  findByIdentifier(identifier: ProductIdentifier): Promise<Product | null>;

  /** Buscar producto por ID (UUID) */
  findById(id: string): Promise<Product | null>;

  /** Listar productos con filtros opcionales */
  findAll(filters?: ProductFilters): Promise<Product[]>;

  /** Contar productos con filtros opcionales */
  count(filters?: ProductFilters): Promise<number>;

  /** Actualizar producto por identificador */
  update(
    identifier: ProductIdentifier,
    updateData: UpdateProductDTO
  ): Promise<Product | null>;

  /** Eliminar producto por identificador */
  delete(identifier: ProductIdentifier): Promise<boolean>;

  /** Verificar si existe un producto con el código dado */
  existsByCode(code: string): Promise<boolean>;

  /** Verificar si existe un producto con la referencia dada */
  existsByReference(reference: string): Promise<boolean>;

    searchByKeywords(keywords: string[], limit?: number, minStock?: number): Promise<Product[]>;

}


