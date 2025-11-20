# Guía de Despliegue

Esta guía te ayudará a desplegar la API de Bailey Star en diferentes entornos.

## 📋 Requisitos Previos

- Node.js >= 16.x instalado
- PostgreSQL >= 12.x instalado y configurado
- Acceso a servidor (VPS, Cloud, etc.)
- Git instalado

## 🚀 Despliegue en Producción

### 1. Preparar el Servidor

```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js (usando nvm)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18

# Instalar PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Instalar PM2 para gestión de procesos
npm install -g pm2
```

### 2. Configurar PostgreSQL

```bash
# Acceder a PostgreSQL
sudo -u postgres psql

# Crear usuario y base de datos
CREATE USER bailey_star WITH PASSWORD 'tu_password_seguro';
CREATE DATABASE bailey_star_inventory OWNER bailey_star;
GRANT ALL PRIVILEGES ON DATABASE bailey_star_inventory TO bailey_star;
\q
```

### 3. Clonar y Configurar el Proyecto

```bash
# Clonar repositorio
git clone <tu-repositorio>
cd bailey-star-api

# Instalar dependencias
npm install

# Crear archivo .env
cp .env.example .env
nano .env
```

Configurar `.env` para producción:
```env
PORT=3000
NODE_ENV=production

DB_HOST=localhost
DB_PORT=5432
DB_NAME=bailey_star_inventory
DB_USER=bailey_star
DB_PASSWORD=tu_password_seguro
DB_MAX_CONNECTIONS=20
DB_IDLE_TIMEOUT=30000
DB_CONNECTION_TIMEOUT=2000
```

### 4. Ejecutar Migraciones

```bash
npm run migrate
```

### 5. Compilar y Ejecutar

```bash
# Compilar TypeScript
npm run build

# Iniciar con PM2
pm2 start dist/index.js --name bailey-star-api

# Guardar configuración de PM2
pm2 save

# Configurar PM2 para iniciar al arrancar el sistema
pm2 startup
```

### 6. Configurar Nginx (Opcional)

```bash
# Instalar Nginx
sudo apt install nginx -y

# Crear configuración
sudo nano /etc/nginx/sites-available/bailey-star-api
```

Contenido del archivo:
```nginx
server {
    listen 80;
    server_name tu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Activar sitio
sudo ln -s /etc/nginx/sites-available/bailey-star-api /etc/nginx/sites-enabled/

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

### 7. Configurar SSL con Let's Encrypt (Opcional)

```bash
# Instalar Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtener certificado
sudo certbot --nginx -d tu-dominio.com

# Renovación automática (ya configurada por Certbot)
sudo certbot renew --dry-run
```

## 🐳 Despliegue con Docker

### Dockerfile

Crear `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "dist/index.js"]
```

### docker-compose.yml

Crear `docker-compose.yml`:
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14-alpine
    environment:
      POSTGRES_DB: bailey_star_inventory
      POSTGRES_USER: bailey_star
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U bailey_star"]
      interval: 10s
      timeout: 5s
      retries: 5

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      PORT: 3000
      DB_HOST: postgres
      DB_PORT: 5432
      DB_NAME: bailey_star_inventory
      DB_USER: bailey_star
      DB_PASSWORD: ${DB_PASSWORD}
    depends_on:
      postgres:
        condition: service_healthy
    restart: unless-stopped

volumes:
  postgres_data:
```

### Ejecutar con Docker

```bash
# Construir y ejecutar
docker-compose up -d

# Ver logs
docker-compose logs -f api

# Ejecutar migraciones
docker-compose exec api npm run migrate

# Detener
docker-compose down
```

## ☁️ Despliegue en Servicios Cloud

### Heroku

```bash
# Instalar Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login
heroku login

# Crear aplicación
heroku create bailey-star-api

# Agregar PostgreSQL
heroku addons:create heroku-postgresql:hobby-dev

# Configurar variables de entorno
heroku config:set NODE_ENV=production

# Desplegar
git push heroku main

# Ejecutar migraciones
heroku run npm run migrate

# Ver logs
heroku logs --tail
```

### AWS EC2

1. Lanzar instancia EC2 (Ubuntu 20.04)
2. Configurar Security Group (puerto 80, 443, 22)
3. Seguir pasos de "Despliegue en Producción"
4. Configurar Elastic IP
5. Configurar Route 53 para DNS

### DigitalOcean

1. Crear Droplet (Ubuntu 20.04)
2. Seguir pasos de "Despliegue en Producción"
3. Configurar Firewall
4. Agregar dominio en DNS

### Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Inicializar proyecto
railway init

# Agregar PostgreSQL
railway add

# Desplegar
railway up

# Ver logs
railway logs
```

## 🔒 Seguridad en Producción

### 1. Variables de Entorno

Nunca commitear el archivo `.env`. Usar servicios de gestión de secretos:

- AWS Secrets Manager
- HashiCorp Vault
- Doppler
- Variables de entorno del servidor

### 2. Firewall

```bash
# Configurar UFW
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 3. PostgreSQL

```bash
# Editar configuración
sudo nano /etc/postgresql/14/main/pg_hba.conf

# Permitir solo conexiones locales
# local   all             all                                     peer
# host    all             all             127.0.0.1/32            md5
```

### 4. Rate Limiting

Instalar `express-rate-limit`:

```bash
npm install express-rate-limit
```

Agregar en `src/app.ts`:
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de requests
});

app.use('/api/', limiter);
```

## 📊 Monitoreo

### PM2 Monitoring

```bash
# Ver estado
pm2 status

# Ver logs
pm2 logs bailey-star-api

# Monitoreo en tiempo real
pm2 monit

# Reiniciar
pm2 restart bailey-star-api

# Detener
pm2 stop bailey-star-api
```

### Logs

Configurar rotación de logs:

```bash
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

## 🔄 Actualización

```bash
# Detener aplicación
pm2 stop bailey-star-api

# Actualizar código
git pull origin main

# Instalar dependencias
npm install

# Ejecutar migraciones si hay
npm run migrate

# Compilar
npm run build

# Reiniciar
pm2 restart bailey-star-api
```

## 💾 Backup

### Script de Backup de PostgreSQL

Crear `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/postgres"
DB_NAME="bailey_star_inventory"

mkdir -p $BACKUP_DIR

pg_dump -U bailey_star $DB_NAME | gzip > $BACKUP_DIR/backup_$DATE.sql.gz

# Mantener solo últimos 7 días
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "Backup completado: backup_$DATE.sql.gz"
```

```bash
# Hacer ejecutable
chmod +x backup.sh

# Agregar a crontab (diario a las 2 AM)
crontab -e
0 2 * * * /path/to/backup.sh
```

## 🧪 Testing en Producción

```bash
# Health check
curl https://tu-dominio.com/api/health

# Crear producto de prueba
curl -X POST https://tu-dominio.com/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "reference": "TEST001",
    "description": "Producto de prueba",
    "stock": 10,
    "wholesale_price_bs": 5.00,
    "retail_price": 6.00,
    "wholesale_price_usd": 3.00
  }'

# Eliminar producto de prueba
curl -X DELETE "https://tu-dominio.com/api/products?reference=TEST001"
```

## 📞 Soporte

Para problemas de despliegue:
1. Revisar logs: `pm2 logs bailey-star-api`
2. Verificar conexión a DB: `npm run migrate`
3. Revisar variables de entorno
4. Verificar puertos y firewall
