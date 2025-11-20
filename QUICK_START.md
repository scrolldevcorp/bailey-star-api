# 🚀 Guía de Inicio Rápido

Esta guía te ayudará a tener la API funcionando en menos de 5 minutos.

## ⚡ Pasos Rápidos

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Base de Datos

Crea una base de datos PostgreSQL:

```sql
CREATE DATABASE bailey_star_inventory;
```

### 3. Configurar Variables de Entorno

Copia el archivo de ejemplo y edítalo:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales de PostgreSQL:

```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bailey_star_inventory
DB_USER=postgres
DB_PASSWORD=tu_password
```

### 4. Ejecutar Migraciones

```bash
npm run migrate
```

### 5. (Opcional) Cargar Datos de Ejemplo

```bash
npm run seed
```

### 6. Iniciar el Servidor

```bash
npm run dev
```

¡Listo! La API está corriendo en `http://localhost:3000`

## 🧪 Probar la API

### Verificar que está funcionando

```bash
curl http://localhost:3000/api/health
```

### Crear tu primer producto

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST001",
    "description": "Mi primer producto",
    "stock": 100,
    "wholesale_price_bs": 10.00,
    "retail_price": 12.00,
    "wholesale_price_usd": 6.00
  }'
```

### Listar productos

```bash
curl http://localhost:3000/api/products
```

### Buscar producto

```bash
curl "http://localhost:3000/api/products/by-identifier?reference=TEST001"
```

### Actualizar stock

```bash
curl -X PATCH "http://localhost:3000/api/products?reference=TEST001" \
  -H "Content-Type: application/json" \
  -d '{"stock": 50}'
```

### Eliminar producto

```bash
curl -X DELETE "http://localhost:3000/api/products?reference=TEST001"
```

## 📚 Siguientes Pasos

1. Lee la [documentación completa](README.md)
2. Revisa los [ejemplos de uso](API_EXAMPLES.md)
3. Importa la colección de Thunder Client para testing
4. Explora los endpoints disponibles

## 🔧 Comandos Útiles

```bash
# Desarrollo con hot-reload
npm run dev

# Compilar TypeScript
npm run build

# Producción
npm start

# Ejecutar migraciones
npm run migrate

# Cargar datos de ejemplo
npm run seed
```

## ❓ Solución de Problemas

### Error de conexión a la base de datos

- Verifica que PostgreSQL está corriendo
- Verifica las credenciales en `.env`
- Asegúrate de que la base de datos existe

```bash
# Verificar PostgreSQL (Windows)
sc query postgresql-x64-14

# Verificar PostgreSQL (Linux/Mac)
sudo systemctl status postgresql
```

### Puerto ya en uso

Si el puerto 3000 está ocupado, cambia `PORT` en `.env`:

```env
PORT=3001
```

### Errores de TypeScript

Asegúrate de tener las dependencias instaladas:

```bash
npm install
```

## 📞 Ayuda

- Revisa los logs en la consola
- Consulta [API_EXAMPLES.md](API_EXAMPLES.md) para ejemplos
- Revisa [DEPLOYMENT.md](DEPLOYMENT.md) para producción

## 🎯 Endpoints Principales

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/products` | Crear producto |
| GET | `/api/products` | Listar productos |
| GET | `/api/products/by-identifier` | Buscar por código/referencia |
| PATCH | `/api/products` | Actualizar producto |
| DELETE | `/api/products` | Eliminar producto |

## 🎨 Herramientas Recomendadas

- **Thunder Client** (VS Code): Importa `thunder-collection.json`
- **Postman**: Para testing de API
- **DBeaver**: Para gestión de PostgreSQL
- **pgAdmin**: Cliente oficial de PostgreSQL

¡Disfruta usando Bailey Star API! 🌟
