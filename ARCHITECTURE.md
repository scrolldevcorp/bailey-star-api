# 🏗️ Arquitectura del Proyecto

Este documento describe la arquitectura y organización del código de Bailey Star API.

## 📐 Patrón de Arquitectura

La API sigue una **arquitectura en capas** (Layered Architecture) con separación clara de responsabilidades:

```
┌─────────────────────────────────────┐
│         HTTP Request                │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Routes Layer                │  ← Definición de rutas
│      (product.routes.ts)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Validation Layer               │  ← Validación de entrada
│   (product.validator.ts)            │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│      Controller Layer               │  ← Manejo de requests/responses
│   (product.controller.ts)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│       Service Layer                 │  ← Lógica de negocio
│    (product.service.ts)             │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│     Repository Layer                │  ← Acceso a datos
│   (product.repository.ts)           │
└──────────────┬──────────────────────┘
               │
┌──────────────▼──────────────────────┐
│         Database                    │  ← PostgreSQL
│         (pg Pool)                   │
└─────────────────────────────────────┘
```

## 📁 Estructura de Carpetas

```
bailey-star-api/
│
├── src/
│   ├── config/              # Configuración
│   │   ├── database.ts      # Configuración de PostgreSQL
│   │   └── environment.ts   # Variables de entorno
│   │
│   ├── constants/           # Constantes
│   │   └── error-codes.ts   # Códigos de error estandarizados
│   │
│   ├── controllers/         # Controladores
│   │   └── product.controller.ts
│   │
│   ├── database/            # Base de datos
│   │   └── migrations/      # Migraciones SQL
│   │       ├── 001_create_products_table.sql
│   │       └── run-migrations.ts
│   │
│   ├── middlewares/         # Middlewares
│   │   ├── async-handler.middleware.ts
│   │   ├── error-handler.middleware.ts
│   │   └── validation.middleware.ts
│   │
│   ├── repositories/        # Repositorios
│   │   └── product.repository.ts
│   │
│   ├── routes/              # Rutas
│   │   ├── index.ts         # Enrutador principal
│   │   └── product.routes.ts
│   │
│   ├── services/            # Servicios
│   │   └── product.service.ts
│   │
│   ├── types/               # Tipos TypeScript
│   │   ├── api-response.types.ts
│   │   └── product.types.ts
│   │
│   ├── utils/               # Utilidades
│   │   ├── api-error.ts     # Clases de error personalizadas
│   │   └── response-builder.ts
│   │
│   ├── validators/          # Validadores
│   │   └── product.validator.ts
│   │
│   ├── app.ts              # Configuración de Express
│   └── index.ts            # Punto de entrada
│
├── scripts/                # Scripts auxiliares
│   └── seed-database.ts    # Seed de datos
│
├── .env.example            # Ejemplo de variables de entorno
├── .gitignore
├── package.json
├── tsconfig.json
├── README.md
├── QUICK_START.md
├── API_EXAMPLES.md
├── DEPLOYMENT.md
├── ARCHITECTURE.md
├── sample-data.json
└── thunder-collection.json
```

## 🔄 Flujo de Datos

### Ejemplo: Crear un Producto

```
1. Cliente → POST /api/products
   ↓
2. Express Router (product.routes.ts)
   ↓
3. Validadores (product.validator.ts)
   - Valida campos requeridos
   - Valida tipos de datos
   - Valida rangos de valores
   ↓
4. Middleware de Validación (validation.middleware.ts)
   - Procesa errores de validación
   - Retorna 400 si hay errores
   ↓
5. Controller (product.controller.ts)
   - Extrae datos del request
   - Llama al servicio
   - Formatea respuesta
   ↓
6. Service (product.service.ts)
   - Valida lógica de negocio
   - Verifica duplicados
   - Llama al repositorio
   ↓
7. Repository (product.repository.ts)
   - Construye query SQL
   - Ejecuta en la base de datos
   - Retorna resultado
   ↓
8. Response Builder (response-builder.ts)
   - Formatea respuesta exitosa
   - Agrega metadata
   ↓
9. Cliente ← 201 Created + JSON
```

## 🎯 Responsabilidades por Capa

### 1. Routes Layer (Rutas)

**Responsabilidad**: Definir endpoints y asociarlos con controladores.

**Características**:
- Define métodos HTTP (GET, POST, PATCH, DELETE)
- Asocia validadores
- Asocia middlewares
- Documenta endpoints

**Ejemplo**:
```typescript
router.post(
  '/',
  ProductValidator.create(),
  handleValidationErrors,
  asyncHandler(productController.createProduct)
);
```

### 2. Validation Layer (Validadores)

**Responsabilidad**: Validar entrada del usuario.

**Características**:
- Valida tipos de datos
- Valida rangos y formatos
- Valida campos requeridos
- Genera mensajes de error descriptivos

**Ejemplo**:
```typescript
body('stock')
  .notEmpty()
  .withMessage('La existencia es requerida')
  .isFloat({ min: 0 })
  .withMessage('La existencia debe ser un número positivo')
```

### 3. Controller Layer (Controladores)

**Responsabilidad**: Manejar requests HTTP y responses.

**Características**:
- Extrae datos del request (body, query, params)
- Llama a servicios
- Maneja errores
- Formatea respuestas HTTP

**No debe**:
- Contener lógica de negocio
- Acceder directamente a la base de datos
- Realizar validaciones complejas

**Ejemplo**:
```typescript
createProduct = async (req: Request, res: Response): Promise<Response> => {
  const productData: CreateProductDTO = req.body;
  const product = await this.productService.createProduct(productData);
  return ResponseBuilder.created(res, product);
};
```

### 4. Service Layer (Servicios)

**Responsabilidad**: Implementar lógica de negocio.

**Características**:
- Valida reglas de negocio
- Coordina operaciones entre repositorios
- Maneja transacciones complejas
- Lanza errores de negocio

**No debe**:
- Conocer detalles de HTTP
- Construir queries SQL directamente

**Ejemplo**:
```typescript
async createProduct(productData: CreateProductDTO): Promise<Product> {
  // Validar que la referencia no exista
  const existingByReference = await this.productRepository.existsByReference(
    productData.reference
  );
  if (existingByReference) {
    throw new ProductAlreadyExistsError('referencia', productData.reference);
  }
  
  return await this.productRepository.create(productData);
}
```

### 5. Repository Layer (Repositorios)

**Responsabilidad**: Acceso a datos y queries SQL.

**Características**:
- Construye queries SQL
- Ejecuta operaciones CRUD
- Maneja errores de base de datos
- Mapea resultados a tipos TypeScript

**No debe**:
- Contener lógica de negocio
- Conocer sobre HTTP o validaciones

**Ejemplo**:
```typescript
async create(productData: CreateProductDTO): Promise<Product> {
  const query = `
    INSERT INTO products (code, reference, description, ...)
    VALUES ($1, $2, $3, ...)
    RETURNING *
  `;
  const result = await this.pool.query(query, values);
  return result.rows[0];
}
```

## 🛡️ Manejo de Errores

### Jerarquía de Errores

```
Error (nativo)
  │
  └─ ApiError (personalizado)
       │
       ├─ ProductNotFoundError
       ├─ ProductAlreadyExistsError
       ├─ ValidationError
       ├─ DatabaseError
       └─ MissingIdentifierError
```

### Flujo de Errores

```
1. Error lanzado en cualquier capa
   ↓
2. Capturado por asyncHandler middleware
   ↓
3. Pasado a errorHandler middleware
   ↓
4. Formateado según tipo de error
   ↓
5. Respuesta JSON estandarizada al cliente
```

## 🔐 Principios de Diseño

### 1. Single Responsibility Principle (SRP)

Cada clase/módulo tiene una única responsabilidad:
- **Controller**: Maneja HTTP
- **Service**: Lógica de negocio
- **Repository**: Acceso a datos

### 2. Dependency Injection

Las dependencias se inyectan en el constructor:

```typescript
export class ProductService {
  constructor(private productRepository: ProductRepository) {}
}
```

### 3. Interface Segregation

Tipos e interfaces bien definidos:
- `Product`: Entidad completa
- `CreateProductDTO`: Datos para crear
- `UpdateProductDTO`: Datos para actualizar
- `ProductIdentifier`: Identificadores

### 4. Open/Closed Principle

Abierto para extensión, cerrado para modificación:
- Fácil agregar nuevos endpoints
- Fácil agregar nuevos campos
- Fácil agregar nuevas validaciones

### 5. DRY (Don't Repeat Yourself)

Código reutilizable:
- `ResponseBuilder`: Respuestas estandarizadas
- `asyncHandler`: Manejo de errores async
- `ApiError`: Errores personalizados

## 🔌 Extensibilidad

### Agregar un Nuevo Endpoint

1. **Definir tipo** en `types/product.types.ts`
2. **Crear validador** en `validators/product.validator.ts`
3. **Agregar método en Repository** en `repositories/product.repository.ts`
4. **Agregar método en Service** en `services/product.service.ts`
5. **Agregar método en Controller** en `controllers/product.controller.ts`
6. **Registrar ruta** en `routes/product.routes.ts`

### Agregar una Nueva Entidad

1. Crear carpeta en `types/` con tipos
2. Crear repositorio en `repositories/`
3. Crear servicio en `services/`
4. Crear controlador en `controllers/`
5. Crear validadores en `validators/`
6. Crear rutas en `routes/`
7. Crear migración en `database/migrations/`
8. Registrar en `routes/index.ts`

## 📊 Patrones Utilizados

### 1. Repository Pattern

Abstrae el acceso a datos, permitiendo cambiar la implementación sin afectar la lógica de negocio.

### 2. Service Layer Pattern

Encapsula la lógica de negocio, manteniéndola separada de la capa de presentación.

### 3. DTO Pattern (Data Transfer Object)

Objetos específicos para transferir datos entre capas.

### 4. Singleton Pattern

La conexión a la base de datos usa singleton para reutilizar el pool de conexiones.

### 5. Factory Pattern

`ResponseBuilder` actúa como factory para crear respuestas estandarizadas.

## 🧪 Testing (Futuro)

La arquitectura facilita el testing:

```typescript
// Unit test de Service (mockear Repository)
const mockRepository = {
  create: jest.fn(),
  findByIdentifier: jest.fn()
};
const service = new ProductService(mockRepository);

// Integration test de Repository (base de datos real)
const repository = new ProductRepository(testPool);

// E2E test (servidor completo)
const response = await request(app)
  .post('/api/products')
  .send(productData);
```

## 🔄 Ciclo de Vida de una Request

```
1. Request llega a Express
2. Middlewares globales (helmet, cors, json parser)
3. Router principal (/api)
4. Router específico (/products)
5. Validadores
6. Middleware de validación
7. AsyncHandler wrapper
8. Controller
9. Service
10. Repository
11. Database
12. Response Builder
13. Response al cliente
14. (Si hay error) Error Handler middleware
```

## 📈 Escalabilidad

La arquitectura permite:

1. **Escalado horizontal**: Múltiples instancias de la API
2. **Caché**: Fácil agregar Redis en la capa de servicio
3. **Queue**: Fácil agregar RabbitMQ/Bull para operaciones async
4. **Microservicios**: Cada módulo puede convertirse en microservicio
5. **GraphQL**: Fácil agregar capa GraphQL sobre servicios existentes

## 🎓 Mejores Prácticas Implementadas

✅ Separación de responsabilidades
✅ Inyección de dependencias
✅ Manejo centralizado de errores
✅ Validación de entrada
✅ Respuestas estandarizadas
✅ Tipos TypeScript estrictos
✅ Código autodocumentado
✅ Configuración por variables de entorno
✅ Migraciones versionadas
✅ Logging estructurado
✅ Seguridad (helmet, validación)

## 📚 Referencias

- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
- [Repository Pattern](https://martinfowler.com/eaaCatalog/repository.html)
- [Service Layer Pattern](https://martinfowler.com/eaaCatalog/serviceLayer.html)
- [Express Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
