# Ejemplos de Uso de la API

Este documento contiene ejemplos prácticos de cómo usar la API de Bailey Star.

## 📋 Tabla de Contenidos

- [Configuración Inicial](#configuración-inicial)
- [Crear Productos](#crear-productos)
- [Consultar Productos](#consultar-productos)
- [Actualizar Productos](#actualizar-productos)
- [Eliminar Productos](#eliminar-productos)
- [Casos de Uso Comunes](#casos-de-uso-comunes)

## 🔧 Configuración Inicial

### Variables de Entorno

Crea un archivo `.env` con:

```env
PORT=3000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=bailey_star_inventory
DB_USER=postgres
DB_PASSWORD=tu_password
```

### Iniciar la API

```bash
# Instalar dependencias
npm install

# Ejecutar migraciones
npm run migrate

# Iniciar en desarrollo
npm run dev
```

## 📦 Crear Productos

### Ejemplo 1: Producto con código y referencia

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "00003",
    "reference": "6949116701",
    "description": "FUNDA P/PEÑE REUTILIZABLE 00004 UND",
    "stock": 209.00,
    "wholesale_price_bs": 4.50,
    "retail_price": 5.40,
    "wholesale_price_usd": 2.80
  }'
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "code": "00003",
    "reference": "6949116701",
    "description": "FUNDA P/PEÑE REUTILIZABLE 00004 UND",
    "stock": 209,
    "wholesale_price_bs": 4.5,
    "retail_price": 5.4,
    "wholesale_price_usd": 2.8,
    "created_at": "2024-11-10T17:30:00.000Z",
    "updated_at": "2024-11-10T17:30:00.000Z"
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Ejemplo 2: Producto sin código (solo referencia)

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

### Ejemplo 3: Producto con stock cero

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "code": "0053",
    "reference": "6923181704",
    "description": "BALON VOLEIBOL N°5 MINSA SPORT 0053 UN",
    "stock": 0,
    "wholesale_price_bs": 7.20,
    "retail_price": 8.70,
    "wholesale_price_usd": 4.50
  }'
```

## 🔍 Consultar Productos

### Ejemplo 1: Listar todos los productos (paginado)

```bash
curl "http://localhost:3000/api/products?page=1&limit=10"
```

### Ejemplo 2: Buscar por referencia

```bash
curl "http://localhost:3000/api/products/by-identifier?reference=VB005"
```

### Ejemplo 3: Buscar por código

```bash
curl "http://localhost:3000/api/products/by-identifier?code=00003"
```

### Ejemplo 4: Buscar por ID

```bash
curl "http://localhost:3000/api/products/1"
```

### Ejemplo 5: Filtrar por descripción

```bash
curl "http://localhost:3000/api/products?description=FUNDA&page=1&limit=20"
```

### Ejemplo 6: Productos con bajo stock

```bash
curl "http://localhost:3000/api/products?maxStock=50"
```

### Ejemplo 7: Productos en un rango de stock

```bash
curl "http://localhost:3000/api/products?minStock=100&maxStock=500"
```

### Ejemplo 8: Filtros combinados

```bash
curl "http://localhost:3000/api/products?description=BALON&minStock=1&page=1&limit=10"
```

## ✏️ Actualizar Productos

### Ejemplo 1: Actualizar solo el stock

```bash
curl -X PATCH "http://localhost:3000/api/products?reference=VB005" \
  -H "Content-Type: application/json" \
  -d '{
    "stock": 500.00
  }'
```

### Ejemplo 2: Actualizar precios

```bash
curl -X PATCH "http://localhost:3000/api/products?code=00003" \
  -H "Content-Type: application/json" \
  -d '{
    "wholesale_price_bs": 5.00,
    "retail_price": 6.00,
    "wholesale_price_usd": 3.20
  }'
```

### Ejemplo 3: Actualizar descripción y stock

```bash
curl -X PATCH "http://localhost:3000/api/products?reference=6949116701" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "FUNDA P/PEÑE REUTILIZABLE 00004 UND - NUEVA VERSION",
    "stock": 300.00
  }'
```

### Ejemplo 4: Agregar código a producto que no lo tenía

```bash
curl -X PATCH "http://localhost:3000/api/products?reference=VB005" \
  -H "Content-Type: application/json" \
  -d '{
    "code": "VB005-NEW"
  }'
```

## 🗑️ Eliminar Productos

### Ejemplo 1: Eliminar por referencia

```bash
curl -X DELETE "http://localhost:3000/api/products?reference=VB005"
```

### Ejemplo 2: Eliminar por código

```bash
curl -X DELETE "http://localhost:3000/api/products?code=00003"
```

## 💼 Casos de Uso Comunes

### Caso 1: Sincronización de Precios desde Otra API

```javascript
// Función para actualizar precios en lote
async function syncPrices(products) {
  const results = [];
  
  for (const product of products) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/products?reference=${product.reference}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            wholesale_price_bs: product.newPrices.wholesaleBs,
            retail_price: product.newPrices.retail,
            wholesale_price_usd: product.newPrices.wholesaleUsd
          })
        }
      );
      
      const data = await response.json();
      results.push({ reference: product.reference, success: data.success });
    } catch (error) {
      results.push({ reference: product.reference, success: false, error: error.message });
    }
  }
  
  return results;
}

// Uso
const productsToUpdate = [
  {
    reference: "VB005",
    newPrices: { wholesaleBs: 5.00, retail: 6.50, wholesaleUsd: 3.50 }
  },
  {
    reference: "6949116701",
    newPrices: { wholesaleBs: 4.80, retail: 5.80, wholesaleUsd: 3.00 }
  }
];

syncPrices(productsToUpdate).then(results => {
  console.log('Resultados:', results);
});
```

### Caso 2: Actualizar Stock después de una Venta

```javascript
async function updateStockAfterSale(reference, quantitySold) {
  // 1. Obtener producto actual
  const getResponse = await fetch(
    `http://localhost:3000/api/products/by-identifier?reference=${reference}`
  );
  const { data: product } = await getResponse.json();
  
  // 2. Calcular nuevo stock
  const newStock = product.stock - quantitySold;
  
  if (newStock < 0) {
    throw new Error('Stock insuficiente');
  }
  
  // 3. Actualizar stock
  const updateResponse = await fetch(
    `http://localhost:3000/api/products?reference=${reference}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: newStock })
    }
  );
  
  return updateResponse.json();
}

// Uso
updateStockAfterSale("VB005", 5)
  .then(result => console.log('Stock actualizado:', result))
  .catch(error => console.error('Error:', error));
```

### Caso 3: Reporte de Productos con Bajo Stock

```javascript
async function getLowStockProducts(threshold = 50) {
  const response = await fetch(
    `http://localhost:3000/api/products?maxStock=${threshold}&limit=100`
  );
  
  const { data: products, metadata } = await response.json();
  
  return {
    products,
    total: metadata.total,
    threshold
  };
}

// Uso
getLowStockProducts(30).then(report => {
  console.log(`Productos con stock menor a ${report.threshold}:`, report.total);
  report.products.forEach(p => {
    console.log(`- ${p.description}: ${p.stock} unidades`);
  });
});
```

### Caso 4: Importar Productos desde Excel

```javascript
async function importProductsFromExcel(excelData) {
  const results = { success: [], errors: [] };
  
  for (const row of excelData) {
    try {
      const productData = {
        code: row.Código || null,
        reference: row.Referencia,
        description: row.Descripción,
        stock: parseFloat(row.Existencia),
        wholesale_price_bs: parseFloat(row['Precio 1 $']),
        retail_price: parseFloat(row['Precio 2 $']),
        wholesale_price_usd: parseFloat(row['Precio 3 $'])
      };
      
      const response = await fetch('http://localhost:3000/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(productData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        results.success.push(productData.reference);
      } else {
        results.errors.push({
          reference: productData.reference,
          error: result.error
        });
      }
    } catch (error) {
      results.errors.push({
        reference: row.Referencia,
        error: error.message
      });
    }
  }
  
  return results;
}
```

### Caso 5: Búsqueda Inteligente

```javascript
async function smartSearch(searchTerm, options = {}) {
  const params = new URLSearchParams({
    description: searchTerm,
    page: options.page || 1,
    limit: options.limit || 20
  });
  
  if (options.minStock) params.append('minStock', options.minStock);
  if (options.maxStock) params.append('maxStock', options.maxStock);
  
  const response = await fetch(
    `http://localhost:3000/api/products?${params.toString()}`
  );
  
  return response.json();
}

// Uso
smartSearch("FUNDA", { minStock: 10, limit: 10 })
  .then(result => {
    console.log(`Encontrados ${result.metadata.total} productos`);
    result.data.forEach(p => {
      console.log(`- ${p.description} (Stock: ${p.stock})`);
    });
  });
```

## 🚨 Manejo de Errores

### Ejemplo de error: Producto no encontrado

```bash
curl "http://localhost:3000/api/products/by-identifier?reference=NO_EXISTE"
```

**Respuesta (404):**
```json
{
  "success": false,
  "error": {
    "code": "ERR_2000",
    "message": "Producto no encontrado: NO_EXISTE"
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Ejemplo de error: Validación fallida

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST",
    "stock": -10
  }'
```

**Respuesta (400):**
```json
{
  "success": false,
  "error": {
    "code": "ERR_1002",
    "message": "Error de validación en los datos enviados",
    "details": [
      {
        "field": "description",
        "message": "La descripción es requerida"
      },
      {
        "field": "stock",
        "message": "La existencia debe ser un número positivo o cero"
      }
    ]
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Ejemplo de error: Producto duplicado

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "VB005",
    "description": "Producto duplicado",
    "stock": 10,
    "wholesale_price_bs": 5.00,
    "retail_price": 6.00,
    "wholesale_price_usd": 3.00
  }'
```

**Respuesta (409):**
```json
{
  "success": false,
  "error": {
    "code": "ERR_2001",
    "message": "Ya existe un producto con referencia: VB005",
    "field": "reference"
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

## 📊 Respuestas de la API

Todas las respuestas siguen el mismo formato:

### Respuesta Exitosa
```json
{
  "success": true,
  "data": { ... },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Respuesta con Paginación
```json
{
  "success": true,
  "data": [ ... ],
  "metadata": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5,
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": {
    "code": "ERR_XXXX",
    "message": "Descripción del error",
    "field": "campo_afectado",
    "details": { ... }
  },
  "metadata": {
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```
