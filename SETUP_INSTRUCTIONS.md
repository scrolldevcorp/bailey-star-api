# 🔧 Instrucciones de Configuración

Este documento te guiará paso a paso para configurar y ejecutar la API de Bailey Star.

## ⚠️ Nota Importante sobre Errores de TypeScript

Los errores de lint que puedes ver en el IDE son **normales** antes de instalar las dependencias. Se resolverán automáticamente después de ejecutar `npm install`.

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

1. **Node.js** (versión 16 o superior)
   ```bash
   node --version  # Debe mostrar v16.x.x o superior
   ```

2. **npm** (viene con Node.js)
   ```bash
   npm --version
   ```

3. **PostgreSQL** (versión 12 o superior)
   ```bash
   psql --version  # Debe mostrar 12.x o superior
   ```

## 🚀 Pasos de Instalación

### Paso 1: Instalar Dependencias

```bash
cd bailey-star-api
npm install
```

Este comando instalará todas las dependencias necesarias:
- express
- pg (driver de PostgreSQL)
- dotenv
- cors
- helmet
- express-validator
- TypeScript y tipos necesarios

**Los errores de TypeScript desaparecerán después de este paso.**

### Paso 2: Configurar PostgreSQL

#### En Windows:

1. Abre pgAdmin o usa la línea de comandos:
```bash
# Abrir psql
psql -U postgres
```

2. Crear la base de datos:
```sql
CREATE DATABASE bailey_star_inventory;
```

3. Salir de psql:
```sql
\q
```

#### En Linux/Mac:

```bash
# Crear base de datos
sudo -u postgres createdb bailey_star_inventory

# O usando psql
sudo -u postgres psql
CREATE DATABASE bailey_star_inventory;
\q
```

### Paso 3: Configurar Variables de Entorno

1. Copiar el archivo de ejemplo:
```bash
cp .env.example .env
```

2. Editar el archivo `.env` con tus credenciales:

**En Windows**, usa notepad:
```bash
notepad .env
```

**En Linux/Mac**, usa nano o vim:
```bash
nano .env
```

3. Configurar las variables:
```env
PORT=3000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bailey_star_inventory
DB_USER=postgres
DB_PASSWORD=TU_PASSWORD_AQUI
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

**⚠️ Importante**: Reemplaza `TU_PASSWORD_AQUI` con tu contraseña real de PostgreSQL.

### Paso 4: Ejecutar Migraciones

```bash
npm run migrate
```

Deberías ver:
```
🔄 Iniciando migraciones...
✅ Migración 001_create_products_table.sql ejecutada exitosamente
✅ Todas las migraciones completadas
```

### Paso 5: (Opcional) Cargar Datos de Ejemplo

```bash
npm run seed
```

Deberías ver:
```
🌱 Iniciando seed de la base de datos...
📦 Encontrados 10 productos para insertar
✅ Producto creado: 6949116701
✅ Producto creado: VB005
...
📊 Resumen:
   ✅ Exitosos: 10
   ❌ Errores: 0
   📦 Total: 10
```

### Paso 6: Iniciar el Servidor

```bash
npm run dev
```

Deberías ver:
```
✅ Database connection established
✅ Database connection test successful
🚀 Servidor iniciado
📍 Puerto: 3000
🌍 Entorno: development
🗄️  Base de datos: bailey_star_inventory
📡 API disponible en: http://localhost:3000
```

## ✅ Verificar que Todo Funciona

### 1. Health Check

Abre tu navegador o usa curl:

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:
```json
{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2024-11-10T17:30:00.000Z"
  }
}
```

### 2. Listar Productos

```bash
curl http://localhost:3000/api/products
```

### 3. Crear un Producto de Prueba

```bash
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d "{\"reference\":\"TEST001\",\"description\":\"Producto de prueba\",\"stock\":10,\"wholesale_price_bs\":5.00,\"retail_price\":6.00,\"wholesale_price_usd\":3.00}"
```

## 🐛 Solución de Problemas

### Error: "Cannot find module 'express'"

**Causa**: No se instalaron las dependencias.

**Solución**:
```bash
npm install
```

### Error: "Connection refused" al conectar a PostgreSQL

**Causa**: PostgreSQL no está corriendo o las credenciales son incorrectas.

**Solución en Windows**:
```bash
# Verificar servicio
sc query postgresql-x64-14

# Iniciar servicio si está detenido
net start postgresql-x64-14
```

**Solución en Linux/Mac**:
```bash
# Verificar estado
sudo systemctl status postgresql

# Iniciar si está detenido
sudo systemctl start postgresql
```

### Error: "database does not exist"

**Causa**: No se creó la base de datos.

**Solución**:
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE bailey_star_inventory;
\q
```

### Error: "Port 3000 is already in use"

**Causa**: Otro proceso está usando el puerto 3000.

**Solución 1**: Cambiar el puerto en `.env`:
```env
PORT=3001
```

**Solución 2**: Detener el proceso que usa el puerto:

En Windows:
```bash
# Encontrar proceso
netstat -ano | findstr :3000

# Matar proceso (reemplaza PID con el número mostrado)
taskkill /PID <PID> /F
```

En Linux/Mac:
```bash
# Encontrar y matar proceso
lsof -ti:3000 | xargs kill -9
```

### Error: "password authentication failed"

**Causa**: Contraseña incorrecta en `.env`.

**Solución**: Verifica la contraseña en `.env` y asegúrate de que coincide con tu contraseña de PostgreSQL.

### Errores de TypeScript persisten después de npm install

**Solución**: Reinicia el servidor de TypeScript en VS Code:
1. Presiona `Ctrl+Shift+P` (o `Cmd+Shift+P` en Mac)
2. Escribe "TypeScript: Restart TS Server"
3. Presiona Enter

## 📦 Scripts Disponibles

| Script | Comando | Descripción |
|--------|---------|-------------|
| Desarrollo | `npm run dev` | Inicia servidor con hot-reload |
| Compilar | `npm run build` | Compila TypeScript a JavaScript |
| Producción | `npm start` | Inicia servidor compilado |
| Migraciones | `npm run migrate` | Ejecuta migraciones de DB |
| Seed | `npm run seed` | Carga datos de ejemplo |

## 🔍 Verificar Instalación de PostgreSQL

### Windows

```bash
# Verificar servicio
sc query postgresql-x64-14

# Ver versión
psql --version
```

### Linux

```bash
# Verificar estado
sudo systemctl status postgresql

# Ver versión
psql --version
```

### Mac

```bash
# Si instalaste con Homebrew
brew services list

# Ver versión
psql --version
```

## 📚 Siguientes Pasos

Una vez que todo esté funcionando:

1. ✅ Lee el [README.md](README.md) para documentación completa
2. ✅ Revisa [API_EXAMPLES.md](API_EXAMPLES.md) para ejemplos de uso
3. ✅ Importa `thunder-collection.json` en Thunder Client o Postman
4. ✅ Explora los endpoints disponibles
5. ✅ Lee [ARCHITECTURE.md](ARCHITECTURE.md) para entender la estructura

## 🎯 Testing Rápido

### Usando curl (Terminal)

```bash
# Health check
curl http://localhost:3000/api/health

# Listar productos
curl http://localhost:3000/api/products

# Crear producto
curl -X POST http://localhost:3000/api/products \
  -H "Content-Type: application/json" \
  -d '{"reference":"TEST","description":"Test","stock":10,"wholesale_price_bs":5,"retail_price":6,"wholesale_price_usd":3}'
```

### Usando el Navegador

Abre en tu navegador:
- http://localhost:3000/
- http://localhost:3000/api/health
- http://localhost:3000/api/products

### Usando Thunder Client (VS Code)

1. Instala la extensión Thunder Client en VS Code
2. Abre Thunder Client
3. Importa `thunder-collection.json`
4. Ejecuta las requests

### Usando Postman

1. Abre Postman
2. Importa `thunder-collection.json`
3. Ejecuta las requests

## 🔐 Seguridad

**⚠️ Importante para Producción**:

1. **Nunca** commitees el archivo `.env`
2. Usa contraseñas fuertes para PostgreSQL
3. Cambia las credenciales por defecto
4. Configura firewall apropiadamente
5. Usa HTTPS en producción

## 📞 Obtener Ayuda

Si tienes problemas:

1. ✅ Revisa este documento
2. ✅ Verifica los logs en la consola
3. ✅ Revisa que PostgreSQL esté corriendo
4. ✅ Verifica las credenciales en `.env`
5. ✅ Asegúrate de haber ejecutado `npm install`
6. ✅ Reinicia el servidor TypeScript en VS Code

## ✨ ¡Listo!

Si llegaste hasta aquí y todo funciona, ¡felicidades! 🎉

Tu API de Bailey Star está lista para usar. Ahora puedes:
- Crear productos
- Listar inventario
- Actualizar precios y stock
- Integrar con otras aplicaciones
- Desplegar en producción

---

**Última actualización**: Noviembre 2024  
**Versión**: 1.0.0
