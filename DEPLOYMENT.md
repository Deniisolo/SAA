# 🚀 Guía de Despliegue - SAA

## Despliegue Gratuito con Vercel + PlanetScale

### 📋 Prerrequisitos
- Cuenta en [GitHub](https://github.com)
- Cuenta en [Vercel](https://vercel.com) (gratuita)
- Cuenta en [PlanetScale](https://planetscale.com) (gratuita)

### 🗄️ Paso 1: Configurar Base de Datos (PlanetScale)

1. **Crear cuenta en PlanetScale:**
   - Ve a [https://planetscale.com](https://planetscale.com)
   - Regístrate con GitHub
   - Crea una nueva base de datos gratuita

2. **Obtener credenciales:**
   - En el dashboard, ve a tu base de datos
   - Haz clic en "Connect" → "Connect with Prisma"
   - Copia la cadena de conexión

3. **Configurar base de datos:**
   ```bash
   # Usar la cadena de conexión de PlanetScale
   DATABASE_URL="mysql://username:password@host:port/database_name"
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
   - `DATABASE_URL`: Cadena de conexión de PlanetScale
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
   node setup-production.js
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

**PlanetScale:**
- 1 base de datos
- 1GB almacenamiento
- 1 billón de filas leídas/mes

### 🎉 ¡Listo!

Tu aplicación SAA estará disponible en:
- **Frontend:** `https://tu-app.vercel.app`
- **Base de datos:** PlanetScale (gratuita)
- **Monitoreo:** Dashboard de Vercel
