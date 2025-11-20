import { Request, Response } from 'express';
import {
  CreateProductDTO,
  UpdateProductDTO,
  ProductIdentifier,
  ProductFilters,
} from '../../../domain/entities/product.entity';
import { ProductService } from '../../../domain/services/product.service';
import { ResponseBuilder } from '../../../core/utils/response-builder';

/**
 * Controlador para operaciones de productos
 */
export class ProductController {
  constructor(private productService: ProductService) {}

  /**
   * Crear un nuevo producto
   * POST /api/products
   */
  createProduct = async (req: Request, res: Response): Promise<Response> => {
    const productData: CreateProductDTO = req.body;
    const product = await this.productService.createProduct(productData);
    return ResponseBuilder.created(res, product);
  };

  /**
   * Crear o actualizar un producto (upsert)
   * PUT /api/products/upsert
   */
  upsertProduct = async (req: Request, res: Response): Promise<Response> => {
    const productData: CreateProductDTO = req.body;
    const product = await this.productService.upsertProduct(productData);
    return ResponseBuilder.created(res, product);
  };

  /**
   * Obtener producto por identificador (código o referencia)
   * GET /api/products/by-identifier?code=XXX&reference=YYY
   */
  getProductByIdentifier = async (req: Request, res: Response): Promise<Response> => {
    const identifier: ProductIdentifier = {
      code: req.query.code as string | undefined,
      reference: req.query.reference as string | undefined,
    };

    const product = await this.productService.getProductByIdentifier(identifier);
    return ResponseBuilder.success(res, product);
  };

  /**
   * Obtener producto por ID
   * GET /api/products/:id
   */
  getProductById = async (req: Request, res: Response): Promise<Response> => {
    const id = req.params.id; // UUID es string
    const product = await this.productService.getProductById(id);
    return ResponseBuilder.success(res, product);
  };

  /**
   * Listar productos con filtros y paginación
   * GET /api/products
   */
  listProducts = async (req: Request, res: Response): Promise<Response> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    const filters: ProductFilters = {
      code: req.query.code as string | undefined,
      reference: req.query.reference as string | undefined,
      description: req.query.description as string | undefined,
      minStock: req.query.minStock ? parseFloat(req.query.minStock as string) : undefined,
      maxStock: req.query.maxStock ? parseFloat(req.query.maxStock as string) : undefined,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      limit,
      offset,
    };

    const { products, total } = await this.productService.listProducts(filters);
    return ResponseBuilder.successPaginated(res, products, page, limit, total);
  };

  /**
   * Actualizar producto por identificador
   * PATCH /api/products?code=XXX&reference=YYY
   */
  updateProduct = async (req: Request, res: Response): Promise<Response> => {
    const identifier: ProductIdentifier = {
      code: req.query.code as string | undefined,
      reference: req.query.reference as string | undefined,
    };

    const updateData: UpdateProductDTO = req.body;
    const product = await this.productService.updateProduct(identifier, updateData);
    return ResponseBuilder.success(res, product);
  };

  /**
   * Eliminar producto por identificador
   * DELETE /api/products?code=XXX&reference=YYY
   */
  deleteProduct = async (req: Request, res: Response): Promise<Response> => {
    const identifier: ProductIdentifier = {
      code: req.query.code as string | undefined,
      reference: req.query.reference as string | undefined,
    };

    await this.productService.deleteProduct(identifier);
    return ResponseBuilder.noContent(res);
  };
}
