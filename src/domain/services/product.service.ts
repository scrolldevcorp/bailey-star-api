
import { MissingIdentifierError, ProductNotFoundError, ValidationError } from '../../core/utils/api-error';
import { CreateProductDTO, Product, ProductFilters, ProductIdentifier, UpdateProductDTO } from '../entities/product.entity';
import { ProductRepository } from '../repositories/product.repository';


/**
 * Servicio de lógica de negocio para productos
 */
export class ProductService {
  constructor(private productRepository: ProductRepository) {}

  /**
   * Crear un nuevo producto
   */
  async createProduct(productData: CreateProductDTO): Promise<Product> {
    // Validar valores numéricos
    this.validateNumericValues(productData);

    return await this.productRepository.create(productData);
  }

  /**
   * Crear o actualizar un producto (upsert) usando código o referencia
   */
  async upsertProduct(productData: CreateProductDTO): Promise<Product> {
    const identifier: ProductIdentifier = {
      code: productData.code || undefined,
      reference: productData.reference,
    };

    if (!identifier.code && !identifier.reference) {
      throw new MissingIdentifierError();
    }

    const existingProduct = await this.productRepository.findByIdentifier(identifier);

    // Validar valores numéricos antes de crear/actualizar
    this.validateNumericValues(productData);

    if (!existingProduct) {
      return await this.productRepository.create(productData);
    }

    const updateData: UpdateProductDTO = {
      code: productData.code,
      reference: productData.reference,
      description: productData.description,
      stock: productData.stock,
      wholesale_price_bs: productData.wholesale_price_bs,
      retail_price: productData.retail_price,
      wholesale_price_usd: productData.wholesale_price_usd,
    };

    const updatedProduct = await this.productRepository.update(identifier, updateData);
    if (!updatedProduct) {
      const identifierStr = identifier.code || identifier.reference || 'desconocido';
      throw new ProductNotFoundError(identifierStr);
    }

    return updatedProduct;
  }

  /**
   * Obtener producto por identificador
   */
  async getProductByIdentifier(identifier: ProductIdentifier): Promise<Product> {
    if (!identifier.code && !identifier.reference) {
      throw new MissingIdentifierError();
    }

    const product = await this.productRepository.findByIdentifier(identifier);
    if (!product) {
      const identifierStr = identifier.code || identifier.reference || 'desconocido';
      throw new ProductNotFoundError(identifierStr);
    }

    return product;
  }

  /**
   * Obtener producto por ID
   */
  async getProductById(id: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(`ID ${id}`);
    }

    return product;
  }

  /**
   * Listar productos con filtros y paginación
   */
  async listProducts(filters?: ProductFilters): Promise<{ products: Product[]; total: number }> {
    const products = await this.productRepository.findAll(filters);
    const total = await this.productRepository.count(filters);

    return { products, total };
  }

  /**
   * Actualizar producto por identificador
   */
  async updateProduct(
    identifier: ProductIdentifier,
    updateData: UpdateProductDTO
  ): Promise<Product> {
    if (!identifier.code && !identifier.reference) {
      throw new MissingIdentifierError();
    }

    // Verificar que el producto existe
    const existingProduct = await this.productRepository.findByIdentifier(identifier);
    if (!existingProduct) {
      const identifierStr = identifier.code || identifier.reference || 'desconocido';
      throw new ProductNotFoundError(identifierStr);
    }

    // Validar valores numéricos
    if (Object.keys(updateData).length > 0) {
      this.validateNumericValues(updateData);
    }

    const updatedProduct = await this.productRepository.update(identifier, updateData);
    if (!updatedProduct) {
      throw new ProductNotFoundError('Producto no encontrado para actualizar');
    }

    return updatedProduct;
  }

  /**
   * Eliminar producto por identificador
   */
  async deleteProduct(identifier: ProductIdentifier): Promise<void> {
    if (!identifier.code && !identifier.reference) {
      throw new MissingIdentifierError();
    }

    // Verificar que el producto existe antes de eliminar
    const existingProduct = await this.productRepository.findByIdentifier(identifier);
    if (!existingProduct) {
      const identifierStr = identifier.code || identifier.reference || 'desconocido';
      throw new ProductNotFoundError(identifierStr);
    }

    const deleted = await this.productRepository.delete(identifier);
    if (!deleted) {
      throw new ProductNotFoundError('No se pudo eliminar el producto');
    }
  }

  /**
   * Validar valores numéricos del producto
   */
  private validateNumericValues(data: CreateProductDTO | UpdateProductDTO): void {
    if ('stock' in data && data.stock !== undefined && data.stock < 0) {
      throw new ValidationError('La existencia no puede ser negativa', 'stock');
    }

    if (
      'wholesale_price_bs' in data &&
      data.wholesale_price_bs !== undefined &&
      data.wholesale_price_bs < 0
    ) {
      throw new ValidationError(
        'El precio al mayor en bolívares no puede ser negativo',
        'wholesale_price_bs'
      );
    }

    if ('retail_price' in data && data.retail_price !== undefined && data.retail_price < 0) {
      throw new ValidationError('El precio al detal no puede ser negativo', 'retail_price');
    }

    if (
      'wholesale_price_usd' in data &&
      data.wholesale_price_usd !== undefined &&
      data.wholesale_price_usd < 0
    ) {
      throw new ValidationError(
        'El precio al mayor en divisas no puede ser negativo',
        'wholesale_price_usd'
      );
    }
  }


  async searchProducts(keywords: string[], limit: number = 10, minStock?: number): Promise<Product[]> {
  if (!keywords || keywords.length === 0) {
    throw new ValidationError('Debe proporcionar al menos una palabra clave', 'keywords');
  }

  // Limpiar y normalizar palabras clave
  const cleanKeywords = keywords
    .map(k => k.trim().toLowerCase())
    .filter(k => k.length > 0);

  if (cleanKeywords.length === 0) {
    throw new ValidationError('Las palabras clave no pueden estar vacías', 'keywords');
  }

  return await this.productRepository.searchByKeywords(cleanKeywords, limit, minStock);
}
}
