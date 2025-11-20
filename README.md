# Bailey Star API - Inventory Management

API REST modular para gestión de inventario con PostgreSQL, desarrollada con TypeScript y Express.

## 🚀 Características

- **Arquitectura modular** con separación de responsabilidades
- **TypeScript** para type-safety
- **PostgreSQL** con driver nativo `pg`
- **Validación robusta** con express-validator
- **Manejo de errores estandarizado** con códigos descriptivos
- **Respuestas API consistentes** con metadata
- **Identificadores flexibles** (código y/o referencia)
- **Paginación** en listados
- **Filtros avanzados** para búsquedas

## 📋 Requisitos

- Node.js >= 16.x
- PostgreSQL >= 12.x
- npm o yarn

## 🛠️ Instalación

1. Clonar el repositorio
```bash
git clone <repository-url>
cd bailey-star-api
```

2. Instalar dependencias
```bash
npm install
```

3. Configurar variables de entorno
```bash
cp .env.example .env
```

Editar `.env` con tus credenciales:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bailey_star_inventory
DB_USER=postgres
DB_PASSWORD=tu_password
```

4. Crear la base de datos
```sql
CREATE DATABASE bailey_star_inventory;
```

5. Ejecutar migraciones
```bash
npm run migrate
```

6. Iniciar el servidor
```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start
```

## 📊 Estructura del Proyecto

```
bailey-star-api/
├── src/
│   ├── config/           # Configuración (DB, environment)
│   ├── constants/        # Constantes y códigos de error
│   ├── controllers/      # Controladores de rutas
│   ├── database/         # Migraciones SQL
│   ├── middlewares/      # Middlewares personalizados
│   ├── repositories/     # Capa de acceso a datos
│   ├── routes/           # Definición de rutas
│   ├── services/         # Lógica de negocio
│   ├── types/            # Tipos TypeScript
│   ├── utils/            # Utilidades
│   ├── validators/       # Validadores de entrada
│   ├── app.ts           # Configuración de Express
│   └── index.ts         # Punto de entrada
├── .env.example         # Ejemplo de variables de entorno
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 Endpoints

### Health Check
```
GET /api/health
```

### Productos

#### Crear Producto
```http
POST /api/products
Content-Type: application/json

{
  "code": "00003",                    // Opcional
  "reference": "6949116701",          // Requerido
  "description": "FUNDA P/PEÑE",
  "stock": 209.00,
  "wholesale_price_bs": 4.50,         // Precio al mayor en Bs
  "retail_price": 5.40,               // Precio al detal
  "wholesale_price_usd": 2.80         // Precio al mayor en USD
}
```

**Respuesta exitosa (201):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "00003",
    "reference": "6949116701",
    "description": "FUNDA P/PEÑE",
    "stock": 209.00,
    "wholesale_price_bs": 4.50,
    "retail_price": 5.40,
    "wholesale_price_usd": 2.80,
    "created_at": "2024-11-10T17:30:00.000Z",
    "updated_at": "2024-11-10T17:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

#### Listar Productos (con paginación y filtros)
```http
GET /api/products?page=1&limit=10&description=FUNDA&minStock=100
```

**Parámetros de query:**
- `page`: Número de página (default: 1)
- `limit`: Elementos por página (default: 10, max: 100)
- `code`: Filtrar por código exacto
- `reference`: Filtrar por referencia (búsqueda parcial)
- `description`: Filtrar por descripción (búsqueda parcial)
- `minStock`: Stock mínimo
- `maxStock`: Stock máximo
- `minPrice`: Precio mínimo
- `maxPrice`: Precio máximo

**Respuesta exitosa (200):**
```json
{
  "success": true,
  "data": [...],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

#### Obtener Producto por Identificador
```http
GET /api/products/by-identifier?reference=6949116701
GET /api/products/by-identifier?code=00003
GET /api/products/by-identifier?code=00003&reference=6949116701
```

**Nota:** Debe proporcionar al menos uno de los identificadores (code o reference).

#### Obtener Producto por ID
```http
GET /api/products/123
```

#### Actualizar Producto
```http
PATCH /api/products?reference=6949116701
Content-Type: application/json

{
  "stock": 150.00,
  "retail_price": 6.00,
  "description": "FUNDA P/PEÑE ACTUALIZADA"
}
```

**Nota:** Todos los campos son opcionales. Solo se actualizan los campos enviados.

#### Eliminar Producto
```http
DELETE /api/products?reference=6949116701
DELETE /api/products?code=00003
```

## ⚠️ Manejo de Errores

Todos los errores siguen un formato estandarizado:

```json
{
  "success": false,
  "error": {
    "code": "ERR_2000",
    "message": "Producto no encontrado",
    "field": "reference",
    "details": {...}
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Códigos de Error Principales

| Código | Descripción |
|--------|-------------|
| ERR_1000 | Error interno del servidor |
| ERR_1001 | Solicitud inválida |
| ERR_1002 | Error de validación |
| ERR_1003 | Error en la base de datos |
| ERR_2000 | Producto no encontrado |
| ERR_2001 | Producto ya existe |
| ERR_2003 | Falta identificador (código o referencia) |
| ERR_2004 | Código duplicado |
| ERR_2005 | Referencia duplicada |
| ERR_3000 | Campo requerido faltante |
| ERR_3001 | Tipo de dato inválido |
| ERR_3002 | Valor inválido para el campo |

## 🔐 Campos del Producto

| Campo | Tipo | Requerido | Descripción |
|-------|------|-----------|-------------|
| code | string | No | Código del producto (máx. 50 caracteres) |
| reference | string | Sí | Referencia única (1-100 caracteres) |
| description | string | Sí | Descripción del producto (1-500 caracteres) |
| stock | number | Sí | Existencia disponible (≥ 0) |
| wholesale_price_bs | number | Sí | Precio al mayor en bolívares (≥ 0) |
| retail_price | number | Sí | Precio al detal (≥ 0) |
| wholesale_price_usd | number | Sí | Precio al mayor en divisas (≥ 0) |

## 🎯 Identificadores Flexibles

La API soporta dos identificadores para máxima flexibilidad:

1. **Código (`code`)**: Opcional, algunos productos pueden no tenerlo
2. **Referencia (`reference`)**: Requerida, todos los productos deben tenerla

Para operaciones de búsqueda, actualización y eliminación, puedes usar:
- Solo el código
- Solo la referencia
- Ambos (se busca por cualquiera de los dos)

## 🧪 Ejemplos de Uso

### Crear producto sin código
```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "VB005",
    "description": "VIBRADOR CONSOLA XBOX TRO-0005 UN",
    "stock": 614.00,
    "wholesale_price_bs": 4.80,
    "retail_price": 5.80,
    "wholesale_price_usd": 3.00
  }'
```

### Actualizar solo el stock y precio
```bash
curl -X PATCH "http://localhost:3000/api/products?reference=VB005" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 500.00,
    "retail_price": 6.50
  }'
```

### Buscar productos con bajo stock
```bash
curl "http://localhost:3000/api/products?maxStock=50&page=1&limit=20"
```

## 🚀 Extensibilidad

La arquitectura está diseñada para ser fácilmente extensible:

### Agregar nuevos campos
1. Actualizar tipos en `src/types/product.types.ts`
2. Modificar migración en `src/database/migrations/`
3. Actualizar validadores en `src/validators/product.validator.ts`
4. Ajustar queries en `src/repositories/product.repository.ts`

### Agregar nuevas consultas
1. Crear método en `ProductRepository`
2. Agregar lógica de negocio en `ProductService`
3. Crear endpoint en `ProductController`
4. Registrar ruta en `product.routes.ts`

## 📝 Scripts Disponibles

```bash
npm run dev       # Iniciar en modo desarrollo con hot-reload
npm run build     # Compilar TypeScript a JavaScript
npm start         # Iniciar servidor en producción
npm run migrate   # Ejecutar migraciones de base de datos
```

## 🤝 Integración con Otras APIs

Esta API está diseñada para ser consumida fácilmente por otras aplicaciones:

```javascript
// Ejemplo: Actualizar precios desde otra API
const updatePrices = async (reference, prices) => {
  const response = await fetch(
    `http://localhost:3000/api/products?reference=${reference}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        wholesale_price_bs: prices.wholesaleBs,
        retail_price: prices.retail,
        wholesale_price_usd: prices.wholesaleUsd
      })
    }
  );
  
  if (!response.ok) {
    const error = await response.json();
    console.error('Error:', error.error.code, error.error.message);
  }
  
  return response.json();
};
```

## 📄 Licencia

ISC

## 👥 Autor

Bailey Star Team
