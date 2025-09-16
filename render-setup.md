# 🚀 Configuración para Despliegue en Render

## 📋 Pasos para desplegar en Render

### 1. Crear Base de Datos PostgreSQL en Render

1. Ve a [Render.com](https://render.com) y crea una cuenta
2. Haz clic en **"New"** → **"PostgreSQL"**
3. Configura la base de datos:
   - **Name**: `saa-database`
   - **Database**: `saa_database`
   - **User**: `saa_user`
   - **Region**: `Oregon (US West)` (o la más cercana)
   - **Plan**: `Free`

### 2. Obtener la URL de Conexión

Una vez creada la base de datos, Render te proporcionará:
- **External Database URL**: `postgresql://saa_user:password@host:port/saa_database`
- **Internal Database URL**: Para uso interno en Render

### 3. Configurar Variables de Entorno en Render

Cuando despliegues tu aplicación web en Render, configura estas variables:

```env
DATABASE_URL=postgresql://saa_user:password@host:port/saa_database
JWT_SECRET=tu-jwt-secret-super-seguro-aqui
NODE_ENV=production
NEXTAUTH_URL=https://tu-app.onrender.com
NEXTAUTH_SECRET=tu-nextauth-secret-aqui
```

### 4. Comandos de Build y Deploy

En Render, configura:
- **Build Command**: `npm install && npx prisma generate && npm run build`
- **Start Command**: `npm start`

### 5. Migrar la Base de Datos

Después del primer despliegue, ejecuta las migraciones:

```bash
# En la consola de Render o localmente con la URL de producción
npx prisma db push
npx prisma db seed
```

## 🔧 Comandos Útiles

```bash
# Generar cliente de Prisma
npx prisma generate

# Sincronizar schema con la base de datos
npx prisma db push

# Ver la base de datos
npx prisma studio

# Resetear base de datos (¡CUIDADO!)
npx prisma migrate reset
```

## 📝 Notas Importantes

- Render PostgreSQL es compatible con Prisma
- El plan gratuito tiene limitaciones de conexiones
- Las bases de datos gratuitas se pausan después de inactividad
- Para producción, considera el plan pago

## 🚨 Solución de Problemas

### Error de Conexión
- Verifica que la URL de la base de datos sea correcta
- Asegúrate de que la base de datos esté activa (no pausada)

### Error de Migración
- Ejecuta `npx prisma generate` antes de `npx prisma db push`
- Verifica que el schema esté actualizado

### Error de Build
- Asegúrate de que todas las dependencias estén en `package.json`
- Verifica que el comando de build incluya `prisma generate`
