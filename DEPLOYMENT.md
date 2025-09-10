# 🚀 Guía de Despliegue - SAA

## Despliegue Gratuito con Vercel + PlanetScale

### 📋 Prerrequisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Cuenta en [PlanetScale](https://planetscale.com) (gratuita)

### 🗄️ Paso 1: Configurar Base de Datos (Railway)

1. **Crear cuenta en Railway:**
   - Ve a [https://railway.app](https://railway.app)
   - Regístrate con GitHub
   - Crea un nuevo proyecto

2. **Crear base de datos MySQL:**
   - Haz clic en "New" → "Database" → "MySQL"
   - Espera a que se complete la configuración (2-3 minutos)

3. **Obtener credenciales:**
   - Haz clic en tu base de datos MySQL
   - Ve a la pestaña "Connect"
   - Copia la "Connection URL"

4. **Configurar base de datos:**
   ```bash
   # Usar la cadena de conexión de Railway
   DATABASE_URL="mysql://root:password@containers-us-west-xxx.railway.app:xxxx/railway"
   ```

### 🌐 Paso 2: Desplegar en Vercel

1. **Subir código a GitHub:**
   ```bash
   git add .
   git commit -m "Preparar para despliegue"
   git push origin main
   ```

2. **Conectar con Vercel:**
   - Ve a [https://vercel.com](https://vercel.com)
   - Conecta tu cuenta de GitHub
   - Importa el repositorio SAA

3. **Configurar variables de entorno en Vercel:**
   - `DATABASE_URL`: Cadena de conexión de Railway
   - `JWT_SECRET`: Clave secreta para JWT (genera una segura)
   - `NEXTAUTH_URL`: URL de tu aplicación (se llenará automáticamente)
   - `NEXTAUTH_SECRET`: Secreto para NextAuth

### 🔧 Paso 3: Configurar Base de Datos en Producción

1. **Ejecutar migraciones:**
   ```bash
   npx prisma db push
   ```

2. **Configurar datos iniciales:**
   ```bash
   node setup-railway.js
   ```

### 📱 Paso 4: Verificar Despliegue

1. **URLs disponibles:**
   - Aplicación: `https://tu-app.vercel.app`
   - API: `https://tu-app.vercel.app/api/hello`

2. **Credenciales de prueba:**
   - **Admin:** `admin@saa.com` / `password`
   - **Instructor:** `instructor@saa.com` / `password`

### 🛠️ Comandos Útiles

```bash
# Desarrollo local
npm run dev

# Construir para producción
npm run build

# Configurar base de datos
npx prisma db push
node setup-production.js

# Generar cliente Prisma
npx prisma generate
```

### 🔍 Solución de Problemas

**Error de conexión a base de datos:**
- Verifica que `DATABASE_URL` esté configurada correctamente
- Asegúrate de que PlanetScale esté activo

**Error de build:**
- Verifica que todas las dependencias estén en `package.json`
- Ejecuta `npm install` localmente para verificar

**Error de Prisma:**
- Ejecuta `npx prisma generate` antes del build
- Verifica que el schema esté actualizado

### 📊 Límites Gratuitos

**Vercel:**
- 100GB bandwidth/mes
- 1000 builds/mes
- Dominio personalizado

**Railway:**
- $5 de crédito gratuito/mes
- MySQL/PostgreSQL
- Suficiente para desarrollo y pruebas

### 🎉 ¡Listo!

Tu aplicación SAA estará disponible en:
- **Frontend:** `https://tu-app.vercel.app`
- **Base de datos:** Railway (gratuita)
- **Monitoreo:** Dashboard de Vercel
